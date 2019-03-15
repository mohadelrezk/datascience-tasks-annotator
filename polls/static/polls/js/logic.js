//define on deployment
var current_host_port = 'http://dke.datascienceinstitute.ie';

var last_question = 187;
// when page loaded do the following
var dontknow = false;
var taskerrorFlag = false;
var slidererrorFlag = false;
var dscience_tasks = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: {
        url: 'get_tasks/',
        filter: function(list) {
            return $.map(list, function(task) {
                return {
                    name: task
                };
            });
        }
    }
});
//global vars
var vote = {}; // for pushing
var concepts = [];
var user_voted_concepts = [];
var user_voted_cursors = [];
var users_votes_count;
var conceptId = '';
var concept_imports = [];
var survey_cursor;
var voter_id = '';
var next_val = '';




$(document).ready(function() {

    // check cookie
    if (getCookie("userid")) {
//        console.log(getCookie("userid"));


        // start preparing vote info
        voter_id = getCookie("userid");

        // get last voted concepts if exists to randomize among them
        get_voted_concepts(voter_id);

        //            get questsions
        //            get_questions();
//        console.log(vote);


    }
    // hide contents
    hide_till_start_survey();
    // hide thansk page
    $('#thanks').hide();
    $('#startsurvey').click(function() {

        if (!validateEmail("voter_id")) //!validateEmail("voter_id"))
        {
            return false;
        } else {

        if (!validateGDPRagreement("agreeToGDPR"))
        {
            return false;
        }else{

            // start preparing vote info
            voter_id = $('#voter_id').val();

            // get last voted concepts if exists to randomize among them
            get_voted_concepts(voter_id);

            //            get questsions
            //            get_questions();
//            console.log(vote);


        }
        }
    });
    //next
    $('#next').click(function() {
        if (!validateTasks("taskstags")) {
             return false;
             } else {
             clean_task_input('taskstags');
             if (!validateConfidence('sliderinput')){
             return false;
                }else{
                    dontknow = false;
                    next_question(dontknow);
                    dscience_tasks.clear();
                    dscience_tasks.clearPrefetchCache();
                    dscience_tasks.clearRemoteCache();
                    dscience_tasks.initialize(true);

            // load new suggestions form databse after user entries
//            console.log('now calling new suggestions')
            // clear suggestions
//        } else {
//        if (!validateConfidence('sliderinput')){
//            return false;
                    }
            //        suggestions_builder ();
//        }
                }
    });
    // dont know
    $('#dontknow').click(function() {
        dontknow = true;
        next_question(dontknow);

    });


    // share survey

    $('#sharesurvey').click(function() {
        share_twitter();

    });

       $('#draw').click(function() {
        enter_draw();

    });


    $('#exit').click(function() {
        onExit();
    });



});

function hide_till_start_survey() {
    $("#content").hide();
    $("#title").hide();

}


function validateEmail(id) {
    var email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
    if (!email_regex.test($("#" + id).val())) {
        var div = $("#" + id).closest("div");
        div.removeClass("has-success");
        $("#glypcn" + id).remove();
        div.addClass("has-error has-feedback");
        div.append('<span id="glypcn' + id + '" class="glyphicon glyphicon-remove form-control-feedback"></span>');
        return false;
    } else {
        var div = $("#" + id).closest("div");
        div.removeClass("has-error");
        $("#glypcn" + id).remove();
        div.addClass("has-success has-feedback");
        div.append('<span id="glypcn' + id + '" class="glyphicon glyphicon-ok form-control-feedback"></span>');
        return true;
    }

}

function validateGDPRagreement(id) {
    var checkBox = document.getElementById("agreeToGDPR");
      if (checkBox.checked == false){
        var div = $("#" + id).closest("div");
        div.removeClass("has-success");
        $("#glypcn" + id).remove();
        div.addClass("has-error has-feedback");
//        div.append('<span id="glypcn' + id + '" class="glyphicon glyphicon-remove form-control-feedback"></span>');
         document.getElementById("agreement").style.color = "#ff0000";

        return false;
    } else {
        var div = $("#" + id).closest("div");
        div.removeClass("has-error");
        $("#glypcn" + id).remove();
        div.addClass("has-success has-feedback");
//        div.append('<span id="glypcn' + id + '" class="glyphicon glyphicon-ok form-control-feedback"></span>');
        document.getElementById("agreement").style.color = "#000000";

        return true;
    }

}

function get_voted_concepts(voter_id) {

    full_url = current_host_port + "/user_votes/" + voter_id + "/";



    // adding promise
    var get_user_votes_promiseObj = new Promise(function(resolve, reject) {

        $.get(full_url, function(data, status) {


            if (status === 'success') {
                user_voted_concepts = data['voted_tasks_concepts'];
                user_voted_cursors = data['voted_tasks_cursors'];
                users_votes_count = user_voted_cursors.length;
                resolve('votes ready!');
            } else {
                reject('data failed!');
            }

        });
    });



    get_user_votes_promiseObj.then((message) => {
        //           set progress bar
        progressBar(users_votes_count);
        //if valid store it and hide intro hide
        // check survey cursor
        if (users_votes_count == last_question) {
            change_next_to_finsh();
            get_questions();
        }
        if (users_votes_count < last_question) {
            get_questions();
        }
        if (users_votes_count == last_question + 1) {
            hide_till_start_survey();
            $('#intro').hide();

            // load thankspage
            $('#thanks').show();

        }


    }).catch((message) => {
        console.log(message);
    });

}

function get_questions() {

    // adding promise
    var get_concepts_promiseObj = new Promise(function(resolve, reject) {

        $.get(current_host_port + "/get_data/", function(data, status) {

            if (status === 'success') {
                concepts = data['concepts'];
                resolve('questions ready!');
            } else {
                reject('data failed!');
            }

        });

    });

    get_concepts_promiseObj.then((message) => {
        //if valid store it and hide intro hide
        start_survey_clicked();
    }).catch((message) => {
        console.log(message);
    });

}

function start_survey_clicked() {
    $('#intro').hide();
    // load data to survey
    load_survey();

}

function load_survey() {
    // load new random question
    // adding promise
    var rand_cursor_promiseObj = new Promise(function(resolve, reject) {

        // genertate random cursor
        survey_cursor = bring_random_question();
        if (survey_cursor) {
//            console.log('random cursor : ' + survey_cursor)

            resolve(survey_cursor);
        } else {
            reject('random cursor failed!');

        }

    });


    rand_cursor_promiseObj.then((random_surv_cursor) => {
        load_new_question(random_surv_cursor);
    }).catch((message) => {
        console.log(message);
    });


    //    refresh slider
    $("#sliderinput").slider({
        ticks: [0, 1, 2, 3, 4, 5],
        ticks_labels: ["0", "1", "2", "3", "4", "5"],
        min: "0",
        max: "5",
        step: "1",
        value: "0",
        tooltip: "show"
    });
    $("#content").fadeIn(1100);
    $("#sliderinput").slider('refresh');
    $("#title").fadeIn('fast');
}

function load_new_question(random_survey_cursor_) {


    //   adding question to ui
    $("#question_body").html("");
    $("#question_body").append(" <p class='card-text dots'> . . . </p>");
    concept_imports = concepts[random_survey_cursor_]['imports'];
    for (var x in concept_imports) {
        $("#question_body").append(" <p class='import'>import</p> <a href='http://www.google.com/search?q="+concept_imports[x]+"+python' target='_blank'> <p class='importstatments'> " + concept_imports[x] + " <sup>&#x1F50D</sup> </p></a>");
        //

        $("#question_body").append("</br>");
    }
    $("#question_body").append(" <p class='card-text dots'> . . . </p>");
    $("#question_body").append(" <p class='card-text dots'> . . . </p>");
}



function next_question(dontknow) {


    next_val = $('#next').val();

    if (next_val === 'Next') {
        // collect vote
        var current_cursor = survey_cursor;
        collect_vote(dontknow, current_cursor);


        // load new random question
        // adding promise
        var rand_cursor_promiseObj = new Promise(function(resolve, reject) {

            // genertate random cursor
            survey_cursor = bring_random_question();
            if (survey_cursor) {
//                console.log('random cursor : ' + survey_cursor)

                resolve(survey_cursor);
            } else {
                reject('random cursor failed!');

            }

        });



        rand_cursor_promiseObj.then((random_surv_cursor) => {
            load_new_question(random_surv_cursor);
        }).catch((message) => {
            console.log(message);
        });

        // check if new question is last question
        if (users_votes_count == last_question) {
            change_next_to_finsh();

        }
    } else {
        // collect vote
        // collect last vote
        var current_cursor = survey_cursor;
        collect_vote(dontknow, current_cursor); // hide survey
        hide_till_start_survey();
        // load thankspage
        $('#thanks').show();
    }
}


function collect_vote(dontknow, current_cursor) {

    // collect vote data
    var d = new Date();
    vote['voter_id'] = voter_id;
    vote['voter_survey_cursor'] = current_cursor;

    vote['concept_id'] = concepts[current_cursor]['id']
    vote['vote_date'] = d.toISOString();
    // fix white spaces and lower case issues
    trimmed_voted_tasks = $(".typeahead").tagsinput('items');
    for (var i in trimmed_voted_tasks){
        trimmed_voted_tasks[i] = trimmed_voted_tasks[i].trim()
        trimmed_voted_tasks[i] = trimmed_voted_tasks[i].toLowerCase();
    }
    vote['vote_tasks'] = trimmed_voted_tasks;

    vote['vote_confidence'] = parseInt($("#sliderinput").val());
    vote['vote_comment'] = $("#comment").val();
    vote['dontknow'] = dontknow;


    // push vote to db
    push_vote(vote);


    //        add answered question to the user history
    user_voted_cursors.push(current_cursor);
    user_voted_concepts.push(current_cursor + 1);
    users_votes_count = user_voted_cursors.length; //1 ;//186; //user_voted_cursors.length;


    //           set progress bar
    progressBar(users_votes_count);



    // clean vote - only keep user id
    setTimeout(
        function() {
//            console.log('waiting before clearing vote ..')
            vote['concept_id'] = -1;
            vote['vote_date'] = '';
            vote['vote_tasks'] = [];
            vote['vote_confidence'] = -1;
            vote['vote_comment'] = '';
            vote['dontknow'] = false;
//            console.log(vote);
        }, 500);




    // clean entries
    $(".typeahead").tagsinput('removeAll');
    $("#sliderinput").val('0');
    $("#sliderinput").slider('refresh');
    $("#comment").val('');
    clean_task_input('taskstags');
    clean_slider_input('sliderinput');

}

function push_vote(vote) {
    $.ajax({
        url: current_host_port + '/submit_vote/',
        type: "POST",
        data: JSON.stringify(vote),
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
    }).

    done(function(data) {});

}

function change_next_to_finsh() {

    $('#next').val('Finish');
    $('#next').text('Finish survey');
    $('#next').removeClass('btn-success');
    $('#next').addClass('btn-danger');
}


function share_twitter() {

    var sharing_text = 'can we automate data science?';
    var sharing_related = 'insight_centre,nuigalway';

    var sharing_hashtags = 'survey,datascience,insight_centre,nuigalway';
    var sharing_via = 'DSIatNUIG';

    var twitterWindow = window.open('https://twitter.com/intent/tweet?url=' + document.URL + '&related=' + sharing_related + '&via=' + sharing_via + '&text=' + sharing_text + '&hashtags=' + sharing_hashtags, 'twitter-popup', 'height=350,width=600');
    if (twitterWindow.focus) {
        twitterWindow.focus();
    }

}
function enter_draw(){

 var win = window.open('https://goo.gl/forms/DupqS7VxKJzLETLf2', '_blank');
  win.focus();

}

function suggestions_builder() {
    dscience_tasks.initialize();
    $('.typeahead').tagsinput({
        typeaheadjs: {
            name: 'dscience_tasks',
            displayKey: 'name',
            valueKey: 'name',
            limit: 10,
            source: dscience_tasks.ttAdapter()
        }
    });
}

function validateTasks(id) {
    if ($(".typeahead").tagsinput('items').length === 0) {
        var div = $("#" + id).closest("div");
        div.removeClass("has-success");
        $("#glypcn" + id).remove();
        div.addClass("has-error has-feedback");
        $("#message1").remove();
        div.append('<p class="dots" id="message1"> please enter at least one task, then press enter<span id="glypcn' + id + '" class="glyphicon glyphicon-remove form-control-feedback"></span> </p>');
        taskerrorFlag = true;
        return false;
    } else {
        var div = $("#" + id).closest("div");
        div.removeClass("has-error");
        $("#glypcn" + id).remove();
        div.addClass("has-success has-feedback");
        return true;
    }
}

function validateConfidence(id) {
    if (parseInt($("#sliderinput").val()) == 0) {
        var div = $("#" + id).closest("div");
        div.removeClass("has-success");
        $("#glypcn" + id).remove();
        div.addClass("has-error has-feedback");
        $("#message2").remove();
        div.append('<p class="dots" id="message2"> please choose a positive confidence value between 1:5 <span id="glypcn' + id + '" class="glyphicon glyphicon-remove form-control-feedback"></span> </p>');
        slidererrorFlag = true;
        return false;
    } else {
        var div = $("#" + id).closest("div");
        div.removeClass("has-error");
        $("#glypcn" + id).remove();
        div.addClass("has-success has-feedback");
        return true;
    }
}

function clean_task_input(id) {
    var div = $("#" + id).closest("div");
    div.removeClass("has-success");
    div.removeClass("has-error has-feedback");
    $("#glypcn" + id).remove();
    $("#message1").remove();

    if (taskerrorFlag === true) {
        $("#glypcn" + id).remove();
    }
}

function clean_slider_input(id) {
    var div = $("#" + id).closest("div");
    div.removeClass("has-success");
    div.removeClass("has-error has-feedback");
    $("#glypcn" + id).remove();
    $("#message2").remove();

    if (slidererrorFlag === true) {
        $("#glypcn" + id).remove();
    }
}
function bring_random_question() {

    //#generate random cursor number
    random_survey_cursor = Math.floor(Math.random() * 188); // concepts are 188 0-187

    // check if it was answerd before
    if (user_voted_cursors.includes(random_survey_cursor)) {
        return bring_random_question();
    } else {
        return random_survey_cursor;
    }

}

function progressBar(users_votes_count_) {

    //        change progress bar value
    $("#progressbar").text(users_votes_count_ + "/188");
    $("#progressbar").attr({
        "aria-valuenow": users_votes_count_
    });
    var percentage = (users_votes_count_ * 100 / 188) + "%"
    console.log(percentage)
    $('#progressbar').css({
        'width': percentage
    });

}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            var uid = c.substring(name.length, c.length);
            return uid.split('"').join('');
        }
    }
    return "";
}

function eraseCookie(cname) {
    document.cookie = "userid=; expires=2000-11-20T15:38:00.698Z; path=/;";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onExit() {
    eraseCookie('userid');
    location.reload();
}
