class Scout {
  constructor(teamsUrl, matchesUrl) {
    this.teamsUrl = teamsUrl;
    this.matchesUrl = matchesUrl;
  }

  async initialize() {
    this.configUI();
    await this.fetchData();
    this.display();
  }

  display() {
    this.displayMatches();
    this.displayTeams();
  }

  async refreshTeams() {
    await this.fetchTeamsData();

    this.displayTeams(document.querySelector('#searcher').value);
  }

  async fetchTeamsData() {
    this.teams = await Scout.getAPIData(this.teamsUrl);

    this.teams.forEach((team) => {
      team.title = team.number.toString();
    });
  }

  async fetchData() {
    console.log('Getting API data...');
    const matches = Scout.getAPIData(this.matchesUrl);

    await this.fetchTeamsData();
    this.matches = await matches;
    console.log('Got data!');
  }

  static async getAPIData(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json.data;
  }

  displayMatches() {
    console.log('Displaying matches...');

    // Put them into the table
    const table = document.querySelector('#match_data');

    this.matches.forEach((match) => {
      table.appendChild(Scout.getMatchElement(match));
    });

    // Sort table
    $('table').tablesort();
    const tablesort = $('table').data('tablesort');

    tablesort.settings.compare = function (a, b) {
      const c = parseInt(a, 10);
      const d = parseInt(b, 10);
      if (c < d) {
        return -1;
      }
      if (c > d) {
        return 1;
      }
      return 0;
    };

    tablesort.sort($('th.default-sort'));

    console.log('Done displaying matches!');
  }

  displayTeams(query) {
    // Get data
    console.log('Displaying teams...');

    const listV = document.getElementById('teamView');
    const myNode = document.getElementById('teamView');

    // Clear teams
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }

    let toDisplay;
    if (arguments.length === 0) {
      // No search
      toDisplay = this.teams;
    } else {
      // Filter the teams list
      toDisplay = this.searchTeams(query.toString());
    }

    toDisplay.forEach((team) => {
      listV.appendChild(Scout.getTeamElement(team));
    });

    this.configTeamUI();

    console.log('Done displaying teams!');
  }

  static getTeamElement(teamData) {
    const next = document.querySelector('#teamTemplate').content.cloneNode(true);

    next.querySelector('.teamname').textContent = `${teamData.title}: ${teamData.name}`;
    next.querySelector('.ui.orange.progress').setAttribute('data-percent', (teamData.objective_score * 10).toString());
    next.querySelector('.ui.blue.progress').setAttribute('data-percent', (teamData.consistency * 10).toString());
    next.querySelector('.ui.violet.progress').setAttribute('data-percent', (teamData.driver_skill * 10).toString());
    next.querySelector('.ui.grey.progress').setAttribute('data-percent', (teamData.autonomous * 10).toString());

    // Decide whether to use an accordion or not
    const max = 25;
    if (teamData.notes.length > max) {
      const node = $('.expand_accordion_notes')[0].content.cloneNode(true);
      next.querySelector('.notescontainer').innerHTML = '';
      node.querySelector('.info.notes.truncate').innerHTML = `${teamData.notes.substring(0, max - 3)}...`;
      next.querySelector('.notescontainer').appendChild(node);

    }
    next.querySelector('.info.notes.detailed').innerHTML = teamData.notes;


    if (teamData.issues.length > max) {
      const node = $('.expand_accordion_issues')[0].content.cloneNode(true);
      next.querySelector('.issuescontainer').innerHTML = '';
      node.querySelector('.info.issues.truncate').innerHTML = `${teamData.issues.substring(0, max - 3)}...`;

      next.querySelector('.issuescontainer').appendChild(node);
    }
    next.querySelector('.info.issues.detailed').innerHTML = teamData.issues;

    return next;
  }

  static getMatchElement(matchData) {
    const nextRow = document.querySelector('#matchRow').content.cloneNode(true);
    nextRow.querySelector('.matchNumber').innerText = matchData.number;
    nextRow.querySelector('.blueAlliance').innerHTML = `${matchData.blue_alliance_1} <br> ${matchData.blue_alliance_2} <br> ${matchData.blue_alliance_3}`;
    nextRow.querySelector('.redAlliance').innerHTML = `${matchData.red_alliance_1} <br> ${matchData.red_alliance_2} <br> ${matchData.red_alliance_3}`;
    nextRow.querySelector('.redScore').innerText = matchData.red_score;
    nextRow.querySelector('.blueScore').innerText = matchData.blue_score;
    nextRow.querySelector('.redRanking').innerText = matchData.red_ranking_points;
    nextRow.querySelector('.blueRanking').innerText = matchData.blue_ranking_points;

    let colour = '';
    if (matchData.red_score > matchData.blue_score) {
      colour = 'negative';
    } else if (matchData.red_score < matchData.blue_score) {
      colour = 'positive';
    }

    nextRow.childNodes.forEach((element) => {
      element.className = colour;
    });

    return nextRow;
  }

  configTeamUI() {
    const self = this;

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

    $('.edit.button').click((event) => {
      const editForm = $('.modal.edit');
      editForm.modal('show');

      const teamElement = event.target.parentElement.parentElement.parentElement;

      // Get the data for this team
      const teamData = this.getTeam(teamElement.querySelector('.teamname').innerHTML.split(':')[0]);

      $('.field_teamnumber').val(teamData.number);
      $('.field_teamname').val(teamData.name);
      $('.field_notes').val(teamData.notes);
      $('.field_issues').val(teamData.issues);

      $('.dropdown.field_autonomous')
        .dropdown('set selected', teamData.autonomous);
      $('.dropdown.field_objscore')
        .dropdown('set selected', teamData.objective_score);
      $('.dropdown.field_driverskill')
        .dropdown('set selected', teamData.driver_skill);
      $('.dropdown.field_consistency')
        .dropdown('set selected', teamData.consistency);
    });

    $('.ui.accordion')
      .accordion();

    $('.delete.button').click(async (event) => {
      // Delete the team
      const teamNumber = event.target.parentElement.parentElement.querySelector('.field_teamnumber').value;
      const url = `${self.teamsUrl}/${teamNumber}`;

      await fetch(url, {
        method: 'delete',
      });

      await this.refreshTeams();

    });

    $('.ui.search')
      .search({
        source: self.teams,
        onSearchQuery(query) {
          self.displayTeams(query);
        },
        onUpdate(query) {
          self.displayTeams(query);
        },
        onSelect(team) {
          self.displayTeams(team.number);
        },
      });
  }

  searchTeams(query) {
    const search = new RegExp(query);
    return this.teams.filter((team) => search.test(team.number.toString()));
  }

  getTeam(number) {
    // eqeq for string/number conversion
    return this.teams.filter((team) => team.number === parseInt(number, 10))[0];
  }

  configUI() {
    const self = this;

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
        url: self.teamsUrl,
        method: 'POST',
        serializeForm: true,
        async onSuccess() {
          await self.refreshTeams();
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

    $('#searcher').keyup((event) => {
      if (event.target.value === '') {
        self.displayTeams();
      }
    });
    $('.item')
      .tab();
  }
}
