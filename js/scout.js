function displayTeams(number) {
  const Http = new XMLHttpRequest();
  const url = 'https://frscout.herokuapp.com/api/v1/teams';

  let content;

  Http.open('GET', url);
  Http.send();
  Http.onreadystatechange = () => {
    if (Http.readyState === 4) {
      const json = JSON.parse(Http.responseText);
      content = json.data;
      content.forEach((element) => {
        element.title = element.number.toString();
      });

      const listV = document.getElementById('teamView');
      const temp = document.getElementsByClassName('team_template')[0];
      const nodeP = temp.content.cloneNode(true);
      const myNode = document.getElementById('teamView');
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
      }

      content.forEach((element) => {
        if (number === -1 || number === '-' || element.title.toString().startsWith(number.toString())) {
          const next = nodeP.cloneNode(true);

          next.querySelector('.teamname').textContent = `${element.title}: ${element.name}`;
          next.querySelector('.ui.orange.progress').setAttribute('data-percent', (element.objective_score * 10).toString());
          next.querySelector('.ui.blue.progress').setAttribute('data-percent', (element.consistency * 10).toString());
          next.querySelector('.ui.violet.progress').setAttribute('data-percent', (element.driver_skill * 10).toString());
          next.querySelector('.ui.grey.progress').setAttribute('data-percent', (element.autonomous * 10).toString());

          // Decide whether to use an accordion or not
          const max = 25;
          if (element.notes.length > max) {
            const node = $('.expand_accordion_notes')[0].content.cloneNode(true);
            next.querySelector('.notescontainer').innerHTML = '';
            node.querySelector('.info.notes.truncate').innerHTML = `${element.notes.substring(0, max - 3)}...`;
            next.querySelector('.notescontainer').appendChild(node);

          }
          next.querySelector('.info.notes.detailed').innerHTML = element.notes;


          if (element.issues.length > max) {
            const node = $('.expand_accordion_issues')[0].content.cloneNode(true);
            next.querySelector('.issuescontainer').innerHTML = '';
            node.querySelector('.info.issues.truncate').innerHTML = `${element.issues.substring(0, max - 3)}...`;

            next.querySelector('.issuescontainer').appendChild(node);
          }
          next.querySelector('.info.issues.detailed').innerHTML = element.issues;

          // next.getElementsByClassName("ui secondary segment")[0].label()
          listV.appendChild(next);
        }
      });
      $('.ui.progress')
        .progress({
          autoSuccess: false,
          showActivity: false,
          barMinWidth: 0,
        });
      $('.edit.modal').modal()
        .modal({
          centered: false,
          onApprove() {
            return $('.ui.form.edit.teamform').form('is valid');
          },
        })
        .modal('attach events', '.edit.button', 'show');

      $('.edit.button').click(function() {
        const m = $('.modal.edit');
        m.modal('show');
        const s = this.parentElement.querySelector('.teamname').innerHTML;
        $('.field_teamnumber').val(s.split(':')[0]);
        $('.field_teamname').val(s.substring(s.indexOf(':') + 1).trim());
        $('.field_notes').val(this.parentElement.parentElement.querySelector('.notes.detailed').textContent);
        $('.field_issues').val(this.parentElement.parentElement.querySelector('.issues.detailed').textContent);

        $('.dropdown.field_autonomous')
          .dropdown('set selected', this.parentElement.parentElement.querySelector('.grey.progress').getAttribute('data-percent') / 10);
        $('.dropdown.field_objscore')
          .dropdown('set selected', this.parentElement.parentElement.querySelector('.orange.progress').getAttribute('data-percent') / 10);
        $('.dropdown.field_driverskill')
          .dropdown('set selected', this.parentElement.parentElement.querySelector('.violet.progress').getAttribute('data-percent') / 10);
        $('.dropdown.field_consistency')
          .dropdown('set selected', this.parentElement.parentElement.querySelector('.blue.progress').getAttribute('data-percent') / 10);
      });
      $('.ui.accordion')
        .accordion();
      $('.delete.button').click(function() {
        const n = this.parentElement.parentElement.querySelector('.field_teamnumber').value;
        const url = `https://frscout.herokuapp.com/api/v1/teams/${n}`;
        $.ajax({
          method: 'delete',
          url,
          success() {
            displayTeams(-1);
          },
        });
      });
    }

  };

  $('.ui.search')
    .search({
      source: content,
      onSearchQuery(e) {
        displayTeams(e);
      },
      onUpdate(e) {
        displayTeams(e);
      },
    });
}

$(document).ready(() => {
  $('.ui.form.teamform')
    .form({
      fields: {
        number: {
          identifier: 'number',
          rules: [{
            type: 'integer',
            prompt: 'Please enter a valid team number',
          }],
        },
      },
      onSuccess() {
        $('.ui.modal.teamform').hide();
      },
    })
    .api({
      url: 'https://frscout.herokuapp.com/api/v1/teams',
      method: 'POST',
      serializeForm: true,
      onSuccess() {
        displayTeams(-1);
      },
    });
  $('.newteam.modal')
    .modal({
      centered: false,
      onApprove() {
        return $('.ui.form.newteam.teamform').form('is valid')
      },
    })
    .modal('attach events', '#newteam_button', 'show');
  $('select.dropdown')
    .dropdown();

  $('#searcher').keyup(function() {
    if (this.value === '') {
      displayTeams(-1);
    }
  });
  displayTeams(-1);


});
