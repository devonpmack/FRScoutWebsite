addEventListener('load', loadSite);

async function loadSite() {
  console.log('Loading site...');

  const scout = new Scout('https://frscout.herokuapp.com/api/v1/teams',
                          'http://frscout.herokuapp.com/api/v1/matches');

  scout.configUI(scout);

  console.log("Getting API data...");
  await scout.fetchData();
  console.log('Got data!');
  scout.display();

  console.log('Done loading site!');
}

async function getAPIData(url) {
  const response = await fetch(url);
  const json = await response.json();
  return json.data;
}
