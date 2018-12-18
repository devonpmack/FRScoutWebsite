addEventListener('load', loadSite);

async function loadSite() {
  configUI();
  await Promise.all([displayMatches(), displayTeams(-1)]);
}

function displayTeams(number) {
  let content;

  fetch('https://frscout.herokuapp.com/api/v1/teams')
    .then((response) => {
      return response.json();
    })
    .then((json) => {
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
        if (!(number === -1 || number === '-' || element.title.toString().startsWith(number.toString()))) {
          return;
        }
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
    })
    .catch(() => {
      console.log("Can't get data!");
    });

  $('.ui.search')
    .search({
      source: content,
      onSearchQuery(event) {
        displayTeams(event);
      },
      onUpdate(event) {
        displayTeams(event);
      },
    });
}

async function displayMatches() {
  console.log('start1');
  const response = await fetch('http://frscout.herokuapp.com/api/v1/matches');
  const json = await response.json();
  const matchData = json.data;

  // Put them into the table
  const table = document.querySelector('#match_data');

  matchData.forEach((match) => {
    const nextRow = document.querySelector('#matchRow').content.cloneNode(true);
    nextRow.querySelector('.matchNumber').innerText = match.number;
    nextRow.querySelector('.blueAlliance').innerHTML = `${match.blue_alliance_1} <br> ${match.blue_alliance_2} <br> ${match.blue_alliance_3}`;
    nextRow.querySelector('.redAlliance').innerHTML = `${match.red_alliance_1} <br> ${match.red_alliance_2} <br> ${match.red_alliance_3}`;
    nextRow.querySelector('.redScore').innerText = match.red_score;
    nextRow.querySelector('.blueScore').innerText = match.blue_score;
    nextRow.querySelector('.redRanking').innerText = match.red_ranking_points;
    nextRow.querySelector('.blueRanking').innerText = match.blue_ranking_points;

    table.appendChild(nextRow);
  });

  $('table')
    .tablesort();

  console.log('stop1');
}

function configUI() {
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
        return $('.ui.form.newteam.teamform').form('is valid');
      },
    })
    .modal('attach events', '#newteam_button', 'show');
  $('select.dropdown')
    .dropdown();

  $('#searcher').keyup(() => {
    if (this.value === '') {
      displayTeams(-1);
    }
  });
  $('.item')
    .tab();
}
