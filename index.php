<?php
/**
 * DashboardBuilder
 *
 * @author Diginix Technologies www.diginixtech.com
 * Support <support@dashboardbuider.net> - https://www.dashboardbuilder.net
 * @copyright (C) 2017 Dashboardbuilder.net
 * @version 2.1.0
 * @license: license.txt
 */

include("inc/dashboard_dist.php");  // copy this file to inc folder 

// for chart #1
$data = new dashboardbuilder(); 
$data->type =  "line";

$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "";
$data->password =  "";
$data->dbname =  "dataNorthwind.db";
$data->xaxisSQL[0]=  "SELECT strftime(^%Y-%m^,o.orderdate) as xaxis, sum(d.quantity) as yaxis from `order details` d, orders o  where o.orderid = d.orderid group by strftime(^%Y-%m^,o.orderdate) limit 50";
$data->xaxisCol[0]=  "xaxis";
$data->yaxisSQL[0]=  "SELECT strftime(^%Y-%m^,o.orderdate) as xaxis, sum(d.quantity) as yaxis from `order details` d, orders o  where o.orderid = d.orderid group by strftime(^%Y-%m^,o.orderdate) limit 50";
$data->yaxisCol[0]=  "yaxis";

$data->name = "col1";
$data->title = "my title";
$data->xaxistitle = "x-axis title";
$data->yaxistitle = "y-axis title";


$result[1] = $data->result();?>

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
#col1{
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
		<?php echo $result[1];?>
	</div>
</div>
</div>
</div>
</body>
