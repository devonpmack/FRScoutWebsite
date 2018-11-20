$(document).ready(function(){
  const Http = new XMLHttpRequest();
  const url='https://frscout.herokuapp.com/api/v1/teams';
  Http.open("GET", url);
  Http.send();
  Http.onreadystatechange=(e)=> {
      if (Http.readyState === 4) {
          var json = JSON.parse(Http.responseText);
          content = json["data"];
          content.forEach(element => {
              element.title = element.number.toString();
          });

          var listV = document.getElementById('teamView');
          var nodeP = document.getElementById('team').cloneNode(true);

          var myNode = document.getElementById("teamView");
          while (myNode.firstChild) {
              myNode.removeChild(myNode.firstChild);
          }

          content.forEach(element => {
              console.log(element['title'])
              var next = nodeP.cloneNode(true);
              next.getElementsByClassName("ui segment")[0].textContent = element['title'] + ": " + element['name'];// + element['notes'];
              next.getElementsByClassName("ui orange progress")[0].setAttribute('data-percent', (element['objective_score'] * 10).toString());
              next.getElementsByClassName("ui blue progress")[0].setAttribute('data-percent', (element['consistency'] * 10).toString());
              next.getElementsByClassName("ui violet progress")[0].setAttribute('data-percent', (element['driver_skill'] * 10).toString());

              next.getElementsByClassName("ui secondary segment")[1].getElementsByClassName("info")[0].innerHTML = element['issues'];
              next.getElementsByClassName("ui secondary segment")[2].getElementsByClassName("info")[0].innerHTML = element['notes'];
              // next.getElementsByClassName("ui secondary segment")[0].label()
              listV.appendChild(next);
          });
          $('.ui.progress')
              .progress({
                  autoSuccess: false,
                  showActivity: false
              })
          ;

          $('.ui.search')
              .search({
                  source: content
              })
          ;
          $('.newteam.modal')
              .modal({
                  centered: false,
                  onApprove: function(e) {
                      if (e.hasClass('positive')) {
                          console.log('test');
                      }
                  }
              })
              .modal('attach events', '.newteam.button', 'show')
              .modal('setting', 'closable', false)
          ;
          $('select.dropdown')
              .dropdown()
          ;
          $('.ui.form')
              .form({
                  fields: {
                      numin: {
                          identifier: 'numin',
                          rules: [
                              {
                                  type   : 'integer',
                                  prompt : 'Please enter a valid team number'
                              }
                          ]
                      }
                  }
              })
          ;
      }
  }

});