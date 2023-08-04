

//Activates view button
$(document).ready(function(){
  document.getElementById("view").disabled = true;

  document.getElementById("filters").addEventListener("change", ()=>{
    if(localStorage.getItem("location")===null || localStorage.getItem("category")===null){
      document.getElementById("view").disabled = true;
    }else{
      document.getElementById("view").disabled = false;
    }
  })  
})

//Load the selects
$(document).ready(function(){
  const country_select = document.getElementById("country");
  country_select.addEventListener("change", (event) =>{
    localStorage.clear();
    document.getElementById("view").disabled = true;
    showLoadingSpinner();
    $("#regions").remove();
    $("#fields").remove();
    localStorage.setItem("country", event.target.value);

    var url_regions = 'https://api.adzuna.com/v1/api/jobs/'+localStorage.getItem("country")+'/geodata?app_id=a7e5c3d9&app_key=428f183310907a46c65123bd4c151028&&content-type=application/json'
    $.getJSON(url_regions)
     .done(function(data) {
      
      var select = $("<select/>");
      var default_option = $("<option/>", {text: "Select Region"})
      default_option.attr("selected");
      default_option.attr("value", null)
      select.append(default_option);
      select.attr("class", "form-select");
      select.attr("aria-label", "Default select example")
      console.log(data.locations[0].location.display_name);
      console.log(data.locations[0].location.area[1]);
      for(region of data.locations){
        var option = $("<option/>", {text: region.location.display_name});
        option.attr("value", region.location.area);
        select.append(option);
      }
      select.attr("id", "regions");
      $("#locations").append(select);
    })
    .fail(function(jsXHR, textStatus, errorThrown){
      alert("Problem accessing Locations Endpoint. Please try again");
    })
    .always(function(){
      hideLoadingSpinner();
    });

    var url_categories = 'https://api.adzuna.com/v1/api/jobs/'+localStorage.getItem("country")+'/categories?app_id=a7e5c3d9&app_key=428f183310907a46c65123bd4c151028&&content-type=application/json'
    $.getJSON(url_categories)
    .done(function(data) {
      
      var select1 = $("<select/>");
      var default_option1 = $("<option/>", {text: "Select Job Category"})
      default_option1.attr("selected");
      default_option1.attr("value", null)
      select1.append(default_option1);

      select1.attr("class", "form-select");
      select1.attr("aria-label", "Default select example")
      for(result of data.results){
        var option = $("<option/>", {text: result.label});
        option.attr("value", result.tag);
        select1.append(option);
      }
      select1.attr("id", "fields")
      $("#categories").append(select1);
  
    })
    .fail(function(jsXHR, textStatus, errorThrown){
      alert("Problem accessing Job Categories Endpoint. Please try again");
    });
  });
})

//Select options
$(document).ready(function(){
  document.getElementById("locations").addEventListener("change", (event) => {
    //console.log(event.target.value);
    localStorage.setItem("location", event.target.value);
    console.log(localStorage.getItem("location"));
  })

  document.getElementById("categories").addEventListener("change", (event) => {
    localStorage.setItem("category", event.target.value)
    console.log(localStorage.getItem("category"));
  })

})

//Handle View button click
$(document).ready(function(){
  document.getElementById("view").addEventListener("click", () => {
    console.log("was clicked")

    $("#top_companies").empty();

    if(Chart.getChart('salaryDistribution')){
      var graph1 = Chart.getChart('salaryDistribution');
      graph1.destroy();
    }

    if(Chart.getChart('salaryHistory')){
      var graph2 = Chart.getChart('salaryHistory');
      graph2.destroy();
    }
   
    document.getElementById("pretext").style.display= "none";
    document.getElementById("visualisation").style.display= "block";
    
    //Loads the top companies
    var url_top_companies = 'https://api.adzuna.com/v1/api/jobs/'+localStorage.getItem("country")+'/top_companies?app_id=a7e5c3d9&app_key=428f183310907a46c65123bd4c151028&what='+localStorage.getItem("category")+'&content-type=application/json'
        $.getJSON(url_top_companies)
        .done(function(data) {

        var table = $("<table/>");
        var head_row = $("<tr/>");
        var head_cell1 =$("<th/>", {text: "Name"});
        var head_cell2 =$("<th/>", {text: "Count"});
        //var head_cell3 =$("<th/>", {text: "Average salary"});
        head_row.append(head_cell1);
        head_row.append(head_cell2);
        //head_row.append(head_cell3);

        table.append(head_row);

        for (leader of data.leaderboard){
            var row = $("<tr/>");
            var cell1 = $("<td/>", {text: leader.canonical_name});
            var cell2 = $("<td/>", {text: leader.count});
            //console.log(leader.count)
            //var cell3 = $("<td/>", {text: leader.average_salary});
            //console.log(leader.average_salary)
            row.append(cell1);
            row.append(cell2);
            //row.append(cell3);
            table.append(row);
        }

        var title = $("<h4/>", {text: 'Top Companies for '+ localStorage.getItem("category")  + ' in ' + localStorage.getItem("location").substring(0, localStorage.getItem("location").indexOf(','))})
        $("#top_companies").append(title);


        table.attr("class", "table table-striped");
        $("#top_companies").append(table);
    })
    .fail(function(jsXHR, textStatus, errorThrown){
      alert("Problem accessing Top Companies Endpoint. Please try again");
    });

    //Loads the salary distribution
    var location_arr = localStorage.getItem("location").split(",");
    var url_sal_distro = 'https://api.adzuna.com/v1/api/jobs/'+localStorage.getItem("country")+'/histogram?app_id=a7e5c3d9&app_key=428f183310907a46c65123bd4c151028&location0='+location_arr[0]+'&location1='+location_arr[1]+'&what='+localStorage.getItem("category")+'&content-type=application/json'
    $.getJSON(url_sal_distro) 
    .done(function(data) {

    var labels = [], datapoints = [];
    for(let key of Object.keys(data.histogram)){
        labels.push(key);
    }

    for(let value of Object.values(data.histogram)){
        datapoints.push(value);
    }

    const ctx = document.getElementById('salaryDistribution');

              let barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: labels,
                  datasets: [{
                    label: 'Salary Distribution for '+ localStorage.getItem("category")  + ' in ' + localStorage.getItem("location"),
                    data: datapoints,
                    borderWidth: 1,
                    backgroundColor: "#0fa1e6"
                  }]
                },
                options: {
                  responsive: true,
                  indexAxis: 'x',
                  plugins: {
                    title:{
                      display: true,
                      text: 'Salary Distribution for '+ localStorage.getItem("category")  + ' in ' + localStorage.getItem("location")
                    }
                  },
                  scales: {
                    y: {
                      display: true,
                      title: {
                        display: true,
                        text:'Count'
                      },
                      beginAtZero: true
                    },
                    x:{
                      display: true,
                      title: {
                        display: true,
                        text: 'Salary Range (in GBP)'
                      }
                    },
                  }
                }
              });

    })
    .fail(function(jsXHR, textStatus, errorThrown){
      alert("Problem accessing Salary Endpoint. Please try again");
    });

    //Loads the salary history
    var url_sal_history = 'https://api.adzuna.com/v1/api/jobs/'+localStorage.getItem("country")+'/history?app_id=a7e5c3d9&app_key=428f183310907a46c65123bd4c151028&location0='+location_arr[0]+'&location1='+location_arr[1]+'&category='+localStorage.getItem("category")+'&content-type=application/json'
    $.getJSON(url_sal_history)
    .done(function(data) {

    var labels = [], datapoints = [];
    for(let key of Object.keys(data.month)){
        labels.push(key);
    }
    labels.sort()

    for(let label of labels){
        datapoints.push(data.month[label]);
    }

    const ctx = document.getElementById('salaryHistory');
    
              let lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: labels,
                  datasets: [{
                    label: 'Salary History for '+ localStorage.getItem("category")  + ' in ' + localStorage.getItem("location"),
                    data: datapoints,
                    borderWidth: 1,
                    backgroundColor: "#0fa1e6",
                    borderColor: "rgb(43, 155, 255, 0.75)"
                  }]
                },
                options: {
                  responsive: true,
                  indexAxis: 'x',
                  plugins: {
                    title:{
                      display: true,
                      text: 'Salary History for '+ localStorage.getItem("category")  + ' in ' + localStorage.getItem("location")
                    }
                  },
                  scales: {
                    y: {
                      display: true,
                      //beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Average Salary'
                      }
                    },
                    x: {
                      display: true,
                      title: {
                        display: true,
                        text: 'Month'
                      }
                    }
                  }
                }
              });

    })
    .fail(function(jsXHR, textStatus, errorThrown){
      alert("Problem accessing Salary History Endpoint. Please try again");
    });


  })
})

//Spinner Function
function showLoadingSpinner() {
  $('.loading-spinner').show();
}

function hideLoadingSpinner() {
  $('.loading-spinner').hide();
}
