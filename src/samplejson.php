<?php
/**
 * DashboardBuilder
 *
 * @author Diginix Technologies www.diginixtech.com
 * Support <support@dashboardbuider.net> - https://www.dashboardbuilder.net
 * @copyright (C) 2016-2022 Dashboardbuilder.net
 * @version 5.4
 * @license: This code is under MIT license, you can find the complete information about the license here: https://dashboardbuilder.net/code-license
 */

include("inc/dashboard_dist.php");  // copy this file to inc folder 


// for chart #1
$data = new dashboardbuilder(); 
$data->type[0]=  "bar";
$data->xaxis[0]= ["Joe","James","Emily"];
$data->xaxisCol[0] = "firstName";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";
$data->yaxis[0]= ["28","32","24"];
$data->yaxisCol[0] = "age";
$data->ysort[0]=  "";
$data->ymodel[0]=  "";

$data->name = "0";
$data->title = "Area Chart";
$data->orientation = "v";
$data->dropdown = "false";
$data->side = "left";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "false";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "true";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "380";
$data->width = "";
$data->col = "0";




$result[0] = $data->result();?>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<script src="assets/js/dashboard.min.js"></script> <!-- copy this file to assets/js folder -->
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css"> <!-- Bootstrap CSS file, change the path accordingly -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/css/font-awesome.min.css">  <!-- Font Awesome CSS file, change the path accordingly -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
<style>
@media screen and (min-width: 960px) {
.id0 {position:absolute;top:13px;}

}
.panel-heading {line-height:0.7em;}
#number {font-size:34px; font-weight:bold;text-align:center;}
#number_legand {font-size:11px; text-align:center;}
.panel-body {  box-shadow: 5px 5px 35px  #e0e0e0;color:#787b80;}
.page-header {margin-top:-30px;}.dropdown-toggle{font-size:12px;line-height:12px;}
	.selectoption {font-size:12px !important;}
	.bs-searchbox > input {
	  font-size: 12px;
	  height:26px;
	}
</style>

</head>
<body> 

<div class="container-fluid main-container">
<div class="col-md-12 col-lg-12 col-xs-12">
	<div class="row">
	<div class="col-md-7 col-lg-7 col-xs-12 col-md-offset-3 id0">
	<div class="panel panel-default">
		<div class="panel-body">
		<span>Area Chart</span>
			<?php echo $result[0];?>
		</div>
	</div>
	</div>
        </div>
</div>
</div>

</body>

<script>

	var url0 = "http://localhost/dashboardbuilder-v54-pro/sample.json";
		var xl00 = [];
		var yl00 = []; 
	      setInterval(function() {
                    $.getJSON(url0+"?"+Math.random().toString(16).slice(2), 
                        function (data) {
                        $.each(data, function (key, value) { 
							   xl00.push(value.firstName); 
                               yl00.push(value.age);});		
			var data_update = {					
				x: [xl00],
				y: [yl00],
				text: [yl00]}; 
			DashboardBuilder.restyle ("col0", data_update);
			  });	 
						xl00 = [];
						yl00 = [];
		}, 3000); 	
		
</script>