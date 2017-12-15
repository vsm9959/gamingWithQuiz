$(document).ready(function(){
    let messages = [];
    let socket = io.connect('http://localhost:3000');
    let chatForm = $('#chatForm');
    let message = $('#chatInput');
    let chatWindow = $('#chatWindow');
    let userForm = $('#userForm');
    let username = $('#username');
    let users = $('#users');
    let userDetails = $('#userDetails');
    let error = $('#error');
    let currentUser = '';

    // Submit User Form
    userForm.on('submit', function(e){
        socket.emit('set user', username.val(), function(data){
            if(data){
                let html = '';
                html = '<h1>' + 'Hey '+ username.val() +'</h1>';
                $('#userFormWrap').hide();
                $('#mainWrap').show();
                $('#questionWrap').show();
                $('#leaderboard').show();
                currentUser = username.val();
                userDetails.html(html);
            } else {
                error.html('Username is taken');
            }
        });
        e.preventDefault();
    });

    //Submit Chat Form
    chatForm.on('submit', function (e) {
        socket.emit('send message', message.val());
        message.val('');
        e.preventDefault();
    });

    //Show Message
    socket.on('show message', function (data) {
        chatWindow.append('<strong>'+ data.user+':' +'</strong>'+ '   ' +data.msg + '<br>');
        
    });

    // Display Usernames
    socket.on('users', function(data){
        let html = '<table class = "table">';
        html += '<thead>'+
        '<tr>'+
        '<th>#</th>'+
        '<th>Name</th>'+
            '<th>Level</th>'+
        '<th>Score</th>'+
        '</tr>'+
        '</thead>'+
        '<tbody>';
        /*for(let i = 0;i < data.length;i++){
            html += '<li class="list-group-item">'+data[i].name+data[i].score+'</li>';
        }*/
        for(let i = 0;i < data.length;i++){
            html += '<tr>'+
            '<td>'+(i+1)+'</td>'+
                '<td>'+data[i].name+'</td>'+
                '<td>'+data[i].level+'</td>'+
                '<td>'+data[i].score+'</td>'+
                '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        users.html(html);
    });



    (function() {
        let questions = [{
            question: "Number of LEGOS in 1x1",
            choices: [0, 1, 2, 3, 4],
            correctAnswer: 1
        }, {
            question: "Number of LEGOS in 2x2",
            choices: [0, 1, 2, 3, 4],
            correctAnswer: 4
        }, {
            question: "Number of LEGOS in 4x4",
            choices: [2, 4, 8, 16, 32],
            correctAnswer: 3
        }, {
            question: "Number of LEGOS in 8x8",
            choices: [4, 16, 64, 128,256],
            correctAnswer: 2
        }, {
            question: "Number of LEGOS in 16x16",
            choices: [4, 16, 64, 128,256],
            correctAnswer: 4
        }];

        let questionCounter = 0; //Tracks question number
        let selections = []; //Array containing user choices
        let quiz = $('#quiz'); //Quiz div object

        // Display initial question
        displayNext();

        // Click handler for the 'next' button
        $('#next').on('click', function (e) {
            e.preventDefault();

            // Suspend click listener during fade animation
            if(quiz.is(':animated')) {
                return false;
            }
            choose();

            // If no user selection, progress is stopped
            if (isNaN(selections[questionCounter])) {
                alert('Please make a selection!');
            } else {
                questionCounter++;
                displayNext();
            }
        });

        // Click handler for the 'prev' button
        /*$('#prev').on('click', function (e) {
            e.preventDefault();

            if(quiz.is(':animated')) {
                return false;
            }
            choose();
            questionCounter--;
            displayNext();
        });*/

        // Click handler for the 'Start Over' button
        $('#start').on('click', function (e) {
            e.preventDefault();

            if(quiz.is(':animated')) {
                return false;
            }
            questionCounter = 0;
            selections = [];
            displayNext();
            $('#start').hide();
        });

        // Animates buttons on hover
        $('.btn').on('mouseenter', function () {
            $(this).addClass('active');
        });
        $('.btn').on('mouseleave', function () {
            $(this).removeClass('active');
        });

        // Creates and returns the div that contains the questions and
        // the answer selections
        function createQuestionElement(index) {
            let qElement = $('<div>', {
                id: 'question'
            });

            let header = $('<h2>Question ' + (index + 1) + ':</h2>');
            qElement.append(header);

            let question = $('<p>').append(questions[index].question);
            qElement.append(question);

            let radioButtons = createRadios(index);
            qElement.append(radioButtons);

            return qElement;
        }

        // Creates a list of the answer choices as radio inputs
        function createRadios(index) {
            let radioList = $('<ul>');
            let item;
            let input = '';
            for (var i = 0; i < questions[index].choices.length; i++) {
                item = $('<li>');
                input = '<input type="radio" name="answer" value=' + i + ' />';
                input += questions[index].choices[i];
                item.append(input);
                radioList.append(item);
            }
            return radioList;
        }

        // Reads the user selection and pushes the value to an array
        function choose() {
            selections[questionCounter] = +$('input[name="answer"]:checked').val();
        }

        // Displays next requested element
        function displayNext() {
            quiz.fadeOut(function() {
                $('#question').remove();

                if(questionCounter < questions.length){
                    let nextQuestion = createQuestionElement(questionCounter);
                    quiz.append(nextQuestion).fadeIn();
                    if (!(isNaN(selections[questionCounter]))) {
                        $('input[value='+selections[questionCounter]+']').prop('checked', true);
                    }

                    // Controls display of 'prev' button
                    if(questionCounter === 1){
                        /*$('#prev').show();*/
                    } else if(questionCounter === 0){

                        /*$('#prev').hide();*/
                        $('#next').show();
                    }
                }else {
                    let scoreElem = displayScore();
                    quiz.append(scoreElem).fadeIn();
                    $('#next').hide();
                    /*$('#prev').hide();*/
                    $('#start').show();
                }
            });
        }

        // Computes score and returns a paragraph element to be displayed
        function displayScore() {
            let socket = io.connect('http://localhost:3000');
            let score = $('<p>',{id: 'question'});

            let numCorrect = 0;
            for (let i = 0; i < selections.length; i++) {
                if (selections[i] === questions[i].correctAnswer) {
                    numCorrect++;
                }
            }

            score.append('You got ' + numCorrect + ' questions out of ' +
                questions.length + ' right!!!');


            socket.emit('send score', {id: currentUser, score: numCorrect});
            console.log('score sent');
            return score;
        }
    })();






});