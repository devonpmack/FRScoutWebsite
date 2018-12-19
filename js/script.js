addEventListener('load', loadSite);

async function loadSite() {
  console.log('Loading site...');

  const scout = new Scout('https://frscout.herokuapp.com/api/v1/teams',
                          'http://frscout.herokuapp.com/api/v1/matches');

  await scout.initialize();

  console.log('Done loading site!');
}
