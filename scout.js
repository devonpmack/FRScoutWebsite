function display_teams(number) {
    console.log(number);
    const Http = new XMLHttpRequest();
    const url = 'https://frscout.herokuapp.com/api/v1/teams';
    var content;

    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            var json = JSON.parse(Http.responseText);
            content = json["data"];
            content.forEach(element => {
                element.title = element.number.toString();
            });

            var listV = document.getElementById('teamView');
            var temp = document.getElementsByClassName("team_template")[0];
            var nodeP = temp.content.cloneNode(true);
            var myNode = document.getElementById("teamView");
            while (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }

            content.forEach(function (element) {
                if (number == -1 || number == '-' || element['title'].toString().startsWith(number.toString())) {
                    var next = nodeP.cloneNode(true);

                    next.querySelector('.teamname').textContent = element['title'] + ": " + element['name'];// + element['notes'];
                    next.querySelector('.ui.orange.progress').setAttribute('data-percent', (element['objective_score'] * 10).toString());
                    next.querySelector('.ui.blue.progress').setAttribute('data-percent', (element['consistency'] * 10).toString());
                    next.querySelector('.ui.violet.progress').setAttribute('data-percent', (element['driver_skill'] * 10).toString());

                    next.querySelector('.info.issues').innerHTML = element['issues'];
                    next.querySelector('.info.notes').innerHTML = element['notes'];
                    // next.getElementsByClassName("ui secondary segment")[0].label()
                    listV.appendChild(next);
                }
            });
            $('.ui.progress')
                .progress({
                    autoSuccess: false,
                    showActivity: false
                })
            ;
            $('.edit.modal').modal()
                .modal({
                    centered: false,
                    onApprove: function (e) {
                        if (!$('.ui.form.edit.teamform').form('is valid')) {
                            return false;
                        }
                    }
                })
                .modal('attach events', '.edit.button', 'show');
            ;

            $('.edit.button').click(function(){
                var m = $('.modal.edit');
                m.modal('show');
                var s = this.parentElement.querySelector('.teamname').innerHTML
                $('.field_teamnumber').val(s.split(':')[0]);
                $('.field_teamname').val(s.substring(s.indexOf(':') + 1).trim());
                $('.field_notes').val(this.parentElement.parentElement.querySelector('.notes').textContent);
                $('.field_issues').val(this.parentElement.parentElement.querySelector('.issues').textContent);

                console.log(this.parentElement.querySelector('.teamname').innerHTML);

            });
        }

    };

    $('.ui.search')
        .search({
            source: content,
            onSearchQuery: function (e) {
                display_teams(e);
            },
            onUpdate: function (e) {
                display_teams(e);
            }
        })
    ;
}

$(document).ready(function () {
    $('.ui.form.teamform')
        .form({
            fields: {
                number: {
                    identifier: 'number',
                    rules: [
                        {
                            type: 'integer',
                            prompt: 'Please enter a valid team number'
                        }
                    ]
                }
            },
            onSuccess: function (e) {
                $('.ui.modal.teamform').hide()
            }
        })
        .api({
            url: 'https://frscout.herokuapp.com/api/v1/teams',
            method: 'POST',
            serializeForm: true,
            beforeSend: function (settings) {
            },
            onSuccess: function (data) {
                display_teams(-1);
            }
        });
    ;
    $('.newteam.modal')
        .modal({
            centered: false,
            onApprove: function (e) {
                if (!$('.ui.form.newteam.teamform').form('is valid')) {
                    return false;
                }
            }
        })
        .modal('attach events', '#newteam_button', 'show')
    ;
    $('select.dropdown')
        .dropdown()
    ;

    $( "#searcher" ).keyup(function() {
        if (this.value == '') {
            console.log(this.value);
            display_teams(-1);
        }
    });
    display_teams(-1);


});