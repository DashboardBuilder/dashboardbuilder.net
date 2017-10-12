<?php
/**
 * DashboardBuilder
 *
 * @author Diginix Technologies www.diginixtech.com
 * Support <support@dashboardbuider.net> - https://www.dashboardbuilder.net
 * @copyright (C) 2017 Dashboardbuilder.net
 * @version 1.0.1
 * @license: license.txt
 */

include("inc/dashboard_dist.php");  // copy this file to inc folder 


// for chart #1
$data = new dashboardbuilder(); 
$data->type =  "heatmap";

$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "localhost";
$data->username =  "root";
$data->password =  "";
$data->dbname =  "data/heatmap.db"; // your database
$data->xaxisSQL[0]=  "SELECT * FROM  tiime"; // sample SQL query
$data->xaxisCol[0]=  "time"; // SQL field;
$data->yaxisSQL[0]=  "PRAGMA table_info(days);";
$data->yaxisCol[0]=  "name";
$data->textSQL[0]=  "SELECT * FROM  days";
$data->textCol[0]=  "SUN";
$data->textSQL[1]=  "SELECT * FROM  days";
$data->textCol[1]=  "MON";
$data->textSQL[2]=  "SELECT * FROM  days";
$data->textCol[2]=  "TUE";
$data->textSQL[3]=  "SELECT * FROM  days";
$data->textCol[3]=  "WED";
$data->textSQL[4]=  "SELECT * FROM  days";
$data->textCol[4]=  "THU";
$data->textSQL[5]=  "SELECT * FROM  days";
$data->textCol[5]=  "FRI";
$data->textSQL[6]=  "SELECT * FROM  days";
$data->textCol[6]=  "SAT";

$data->name = "col0";
$data->title = "Heatmap Chart";
$data->orientation = "";
$data->xaxistitle = "Time";
$data->yaxistitle = "Days";
$data->showgrid = "";
$data->showline = "";
$data->height = "";
$data->width = "";
$data->tracename[0]=  "area";

$result[0] = $data->result();?>

<!DOCTYPE html>
<html>
<head>
	<script src="assets/js/dashboard.min.js"></script> <!-- copy this file to assets/js folder -->
	<link rel="stylesheet" href="css/bootstrap.min.css"> <!-- Bootstrap CSS file, change the path accordingly -->
	
<style> 
<!-- adjust the height width as per your need -->;
/*
#col0{
height:350px;
}
*/
</style>

</head>
<body> 
<div class="container">
<div class="col-lg-12">
<div class="panel panel-default">
<div class="panel-heading"></div>
	<div class="panel-body">
		<?php echo $result[0];?>
	</div>
</div>
</div>
</div>
</body>
