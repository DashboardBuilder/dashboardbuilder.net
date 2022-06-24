<?php
/**
 * DashboardBuilder
 *
 * @author Diginix Technologies www.diginixtech.com
 * Support <support@dashboardbuider.net> - https://www.dashboardbuilder.net
 * @copyright (C) 2016-2022 Dashboardbuilder.net
 * @version 5.5
 * @license: This code is under MIT license, you can find the complete information about the license here: https://dashboardbuilder.net/code-license
 */

include("inc/dashboard_dist.php");  // copy this file to inc folder 
?>
<!DOCTYPE html>
<html lang="en-us" dir="ltr">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<script src="https://cdn.jsdelivr.net/gh/DashboardBuilder/cdn@master/v55/dashboard.min.js"></script> <!-- copy this file to assets/js folder -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DashboardBuilder/cdn@master/v55/bootstrap.min.css"> <!-- Bootstrap 5 CSS file, change the path accordingly -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DashboardBuilder/cdn@master/v55/font-awesome.min.css">  <!-- Font Awesome CSS file, change the path accordingly -->
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/DashboardBuilder/cdn@master/v55/bootstrap-select.min.css"  /> <!-- copy this file to assets/css folder -->
<script src="https://cdn.jsdelivr.net/gh/DashboardBuilder/cdn@master/v55/jquery.min.js"></script> <!-- copy this file to assets/js folder -->
<script src="https://cdn.jsdelivr.net/gh/DashboardBuilder/cdn@master/v55/bootstrap.bundle.min.js"></script> <!-- copy this file to assets/js folder -->
<script src="https://cdn.jsdelivr.net/gh/DashboardBuilder/cdn@master/v55/bootstrap-select.min.js" ></script> <!-- copy this file to assets/js folder -->
<style>
@media screen and (min-width: 960px) {
.id0 {position:absolute;top:40px;}
.id1 {position:absolute;top:40px;}
.id2 {position:absolute;top:41px;}
.id3 {position:absolute;top:40px;}
.id4 {position:absolute;top:195px;}
.id5 {position:absolute;top:197px;}
.id6 {position:absolute;top:194px;}
.id7 {position:absolute;top:449px;}
.id8 {position:absolute;top:450px;}
.id9 {position:absolute;top:450px;}

}
.card-header {line-height:0.7em;}
#number {font-size:34px; font-weight:bold;text-align:center;}
#number_legand {font-size:11px; text-align:center;}
.panel-body {  box-shadow: 5px 5px 35px  #e0e0e0;color:#787b80;}
.page-header {margin-top:-30px;}.dropdown-toggle{font-size:12px;line-height:12px;}
	.selectoption {font-size:12px !important;}
	.bs-searchbox > input {
	  font-size: 12px;
	  height:26px;
	}
.id0 .card-body{background:#ff531a; color:#FFF;}
.id1 .card-body{background:#32b811; color:#FFF;}
.id2 .card-body{background:#1a9cff; color:#FFF;}
.id3 .card-body{background:#5139db; color:#FFF;}
</style>

</head>
<body> 
<div class="col col-12 col-lg-12 col-md-12 col-xs-12 card card-default" id="showhide-filterid" style="margin:0;padding:0;">
<div class="card-header m-0 p-1">
<span id="filteridshow"></span>
<button type="submit" class="btn btn-sm btn-link text-dark close" onClick="window.location.href = window.location.href;" style="font-size:14px;" ><span id="filterrefresh" class="fa fa-refresh" style="float:right;"></span></button>
</div>
</div>
<?php
// for chart #1
$data = new dashboardbuilder(); 
$data->type[0]=  "number";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "false";
$data->xaxisSQL[0]=  "SELECT round( avg(UnitPrice*Quantity),2) as amount FROM OrderDetails;";
$data->xaxisCol[0]=  "amount";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";

$data->name = "0";
$data->title = " ";
$data->orientation = "v";
$data->dropdown = "false";
$data->side = "right";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "false";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "false";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "82";
$data->width = "0";
$data->col = "0";



$data->tracename[0]=  "<span style='top:70px;'>Last 1000 Subscribes<span style='color:black;'>▲</span></span><span class='fa fa-paper-plane' style='font-size:44px;position:relative;top:-50px;left:-150px;color:#fff;'></span>";
$data->color[0]=  "#ff531a";

$result[0] = $data->result();
// for chart #2
$data = new dashboardbuilder(); 
$data->type[0]=  "number";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "false";
$data->xaxisSQL[0]=  "SELECT sum(UnitsOnOrder) as unitorder FROM Products";
$data->xaxisCol[0]=  "unitorder";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";

$data->name = "1";
$data->title = " ";
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
$data->datalabel = "false";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "82";
$data->width = "0";
$data->col = "1";



$data->tracename[0]=  "<span style='top:70px;'>Number of Order Last month  <span style='color:green;'>▲</span></span><span class='fa fa-thumbs-up' style='font-size:44px;position:relative;top:-50px;left:-150px;color:#fff;'></span>";
$data->color[0]=  "#32b811";

$result[1] = $data->result();
// for chart #3
$data = new dashboardbuilder(); 
$data->type[0]=  "number";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "false";
$data->xaxisSQL[0]=  "SELECT round(avg(UnitPrice),2) as amount FROM OrderDetails";
$data->xaxisCol[0]=  "amount";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";

$data->name = "2";
$data->title = " ";
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
$data->datalabel = "false";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "81";
$data->width = "0";
$data->col = "2";



$data->tracename[0]=  "<span >Averge Profit Previous Month <span style='color:red;'>▼</span><span class='fa fa-flag' style='font-size:44px;;position:relative;top:-44px;left:-180px;color:#fff;'></span>";
$data->color[0]=  "#1a9cff";

$result[2] = $data->result();
// for chart #4
$data = new dashboardbuilder(); 
$data->type[0]=  "number";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "false";
$data->xaxisSQL[0]=  "SELECT round(avg(UnitsOnOrder*5),2) as unitorder FROM Products";
$data->xaxisCol[0]=  "unitorder";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";

$data->name = "3";
$data->title = " ";
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
$data->datalabel = "false";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "83";
$data->width = "0";
$data->col = "3";



$data->tracename[0]=  "<span >Average Users visited per day <span style='color:red;'>▼</span><span class='fa fa-bullseye' style='font-size:44px;position:relative;top:-44px;left:-180px;color:#fff;'></span>";
$data->color[0]=  "#5139db";

$result[3] = $data->result();
// for chart #5
$data = new dashboardbuilder(); 
$data->type[0]=  "stack";
$data->type[1]=  "stack";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "true";
$data->xaxisSQL[0]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->xaxisCol[0]=  "Sales 1997";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";
$data->xaxisSQL[1]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->xaxisCol[1]=  "Sales 1998";
$data->xsort[1]=  "";
$data->xmodel[1]=  "";
$data->forecast[1]=  "";
$data->yaxisSQL[0]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->yaxisCol[0]=  "CategoryName";
$data->ysort[0]=  "";
$data->ymodel[0]=  "";
$data->yaxisSQL[1]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->yaxisCol[1]=  "CategoryName";
$data->ysort[1]=  "";
$data->ymodel[1]=  "";

$data->name = "4";
$data->title = "";
$data->orientation = "h";
$data->dropdown = "false";
$data->side = "";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "true";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "true";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "183";
$data->width = "";
$data->col = "4";



$data->color[0]=  "#334bd2";
$data->color[1]=  "#afbbe7";

$result[4] = $data->result();
// for chart #6
$data = new dashboardbuilder(); 
$data->type[0]=  "bubble";
$data->type[1]=  "bubble";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "true";
$data->xaxisSQL[0]=  "select p.reorderlevel as Demand, p.unitprice as ^Unit Price^, sum(o.quantity) as Sales, p.productname as ^Product^ from products p, ^OrderDetails^ o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->xaxisCol[0]=  "Sales";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";
$data->xaxisSQL[1]=  "select p.reorderlevel as Demand, p.unitprice as ^Unit Price^, sum(o.quantity) as Sales, p.productname as ^Product^ from products p, ^OrderDetails^ o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->xaxisCol[1]=  "Sales";
$data->xsort[1]=  "";
$data->xmodel[1]=  "";
$data->forecast[1]=  "";
$data->yaxisSQL[0]=  "select p.reorderlevel as Demand, p.unitprice as ^Unit Price^, sum(o.quantity) as Sales, p.productname as ^Product^ from products p, ^OrderDetails^ o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->yaxisCol[0]=  "Unit Price";
$data->ysort[0]=  "";
$data->ymodel[0]=  "";
$data->yaxisSQL[1]=  "select p.reorderlevel as Demand, p.unitprice as ^Unit Price^, sum(o.quantity) as Sales, p.productname as ^Product^ from products p, ^OrderDetails^ o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->yaxisCol[1]=  "Demand";
$data->ysort[1]=  "";
$data->ymodel[1]=  "";
$data->sizeSQL[0]=  "select p.reorderlevel as Demand, p.unitprice as ^Unit Price^, sum(o.quantity) as Sales, p.productname as ^Product^ from products p, ^OrderDetails^ o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->sizeCol[0]=  "Demand";
$data->sizeSQL[1]=  "select p.reorderlevel as Demand, p.unitprice as 'Unit Price', sum(o.quantity) as Sales, p.productname as 'Product' from products p, OrderDetails o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->sizeCol[1]=  "Unit Price";
$data->textSQL[0]=  "select p.reorderlevel as Demand, p.unitprice as ^Unit Price^, sum(o.quantity) as Sales, p.productname as ^Product^ from products p, ^OrderDetails^ o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->textCol[0]=  "Product";
$data->textSQL[1]=  "select p.reorderlevel as Demand, p.unitprice as 'Unit Price', sum(o.quantity) as Sales, p.productname as 'Product' from products p, OrderDetails o where o.productid = p.productid group by product having p.unitprice < 100 and demand > 5 limit 5";
$data->textCol[1]=  "Product";

$data->name = "5";
$data->title = "";
$data->orientation = "v";
$data->dropdown = "false";
$data->side = "";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "true";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "false";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "181";
$data->width = "";
$data->col = "5";



$data->color[0]=  "#FF1D1A";
$data->color[1]=  "#334bd2";

$result[5] = $data->result();
// for chart #7
$data = new dashboardbuilder(); 
$data->type[0]=  "area";
$data->type[1]=  "area";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "";
$data->xaxisSQL[0]=  "SELECT strftime(^%Y-%m^,o.shippeddate) as xaxis, sum(d.quantity) as yaxis, sum(d.UnitPrice) as yaxis2 from OrderDetails d, orders o where o.orderid = d.orderid group by strftime(^%Y-%m^,o.orderdate) limit 50";
$data->xaxisCol[0]=  "xaxis";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";
$data->xaxisSQL[1]=  "SELECT strftime(^%Y-%m^,o.shippeddate) as xaxis, sum(d.quantity) as yaxis, sum(d.UnitPrice) as yaxis2 from OrderDetails d, orders o where o.orderid = d.orderid group by strftime(^%Y-%m^,o.orderdate) limit 50";
$data->xaxisCol[1]=  "xaxis";
$data->xsort[1]=  "";
$data->xmodel[1]=  "";
$data->forecast[1]=  "";
$data->yaxisSQL[0]=  "SELECT strftime(^%Y-%m^,o.shippeddate) as xaxis, sum(d.quantity) as yaxis, sum(d.UnitPrice) as yaxis2 from OrderDetails d, orders o where o.orderid = d.orderid group by strftime(^%Y-%m^,o.orderdate) limit 50";
$data->yaxisCol[0]=  "yaxis2";
$data->ysort[0]=  "";
$data->ymodel[0]=  "";
$data->yaxisSQL[1]=  "SELECT strftime(^%Y-%m^,o.shippeddate) as xaxis, sum(d.quantity) as yaxis, sum(d.UnitPrice) as yaxis2 from OrderDetails d, orders o where o.orderid = d.orderid group by strftime(^%Y-%m^,o.orderdate) limit 50";
$data->yaxisCol[1]=  "yaxis";
$data->ysort[1]=  "";
$data->ymodel[1]=  "";

$data->name = "6";
$data->title = "";
$data->orientation = "v";
$data->dropdown = "false";
$data->side = "";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "false";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "184";
$data->width = "";
$data->col = "6";



$data->color[0]=  "#1A85FF";
$data->color[1]=  "#791AFF";

$result[6] = $data->result();
// for chart #8
$data = new dashboardbuilder(); 
$data->type[0]=  "donut";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "true";
$data->xaxisSQL[0]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->xaxisCol[0]=  "Sales 1997";
$data->xsort[0]=  "DSC";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";
$data->yaxisSQL[0]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->yaxisCol[0]=  "CategoryName";
$data->ysort[0]=  "";
$data->ymodel[0]=  "";

$data->name = "7";
$data->title = "";
$data->orientation = "v";
$data->dropdown = "false";
$data->side = "";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "true";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "true";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "204";
$data->width = "";
$data->col = "7";



$data->tracename[0]=  "show";
$data->color[0]=  "#334bd2";

$result[7] = $data->result();
// for chart #9
$data = new dashboardbuilder(); 
$data->type[0]=  "map";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/country.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "false";
$data->xaxisSQL[0]=  "SELECT * FROM GDP;";
$data->xaxisCol[0]=  "CODE";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";
$data->yaxisSQL[0]=  "SELECT * FROM GDP;";
$data->yaxisCol[0]=  "GDP";
$data->ysort[0]=  "";
$data->ymodel[0]=  "";
$data->textSQL[0]=  "SELECT * FROM GDP;";
$data->textCol[0]=  "COUNTRY";

$data->name = "8";
$data->title = "";
$data->orientation = "v";
$data->dropdown = "false";
$data->side = "";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "false";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "false";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "200";
$data->width = "450";
$data->col = "8";



$data->maptype[0]=  "world";

$result[8] = $data->result();
// for chart #10
$data = new dashboardbuilder(); 
$data->type[0]=  "bar";
$data->type[1]=  "bar";
$data->type[2]=  "line";

$data->legacy = "";
$data->source =  "Database"; 
$data->rdbms =  "sqlite"; 
$data->servername =  "";
$data->username =  "administrator";
$data->password =  "admin01";
$data->dbname =  "data/Northwind.db";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filterlabel = "Filter";
$data->forecastlabel = "Forecast";
$data->filter = "";
$data->xaxisSQL[0]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->xaxisCol[0]=  "CategoryName";
$data->xsort[0]=  "";
$data->xmodel[0]=  "";
$data->forecast[0]=  "";
$data->xaxisSQL[1]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->xaxisCol[1]=  "CategoryName";
$data->xsort[1]=  "";
$data->xmodel[1]=  "";
$data->forecast[1]=  "";
$data->xaxisSQL[2]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->xaxisCol[2]=  "CategoryName";
$data->xsort[2]=  "";
$data->xmodel[2]=  "";
$data->forecast[2]=  "";
$data->yaxisSQL[0]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->yaxisCol[0]=  "Sales 1997";
$data->ysort[0]=  "";
$data->ymodel[0]=  "";
$data->yaxisSQL[1]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->yaxisCol[1]=  "Sales 1998";
$data->ysort[1]=  "";
$data->ymodel[1]=  "";
$data->yaxisSQL[2]=  "select c.categoryname, sum(a.quantity) as ^Sales 1997^, sum(a.quantity)+1000 as ^Sales 1998^ from products b, OrderDetails a, categories c where a.productid = b.productid and c.categoryid = b.categoryid group by c.categoryid order by c.categoryid";
$data->yaxisCol[2]=  "Sales 1997";
$data->ysort[2]=  "";
$data->ymodel[2]=  "";

$data->name = "9";
$data->title = "";
$data->orientation = "v";
$data->dropdown = "false";
$data->side = "";
$data->toImage = "Download graph";
$data->zoomin = "Zoom in";
$data->zoomout = "Zoom out";
$data->autoscale = "Reset";
$data->filter = "";
$data->forecastlabel = "Forecast";
$data->legposition = "";
$data->xaxistitle = "";
$data->yaxistitle = "";
$data->datalabel = "true";
$data->showgrid = "true";
$data->showline = "true";
$data->height = "194";
$data->width = "";
$data->col = "9";



$data->color[0]=  "#afbbe7";
$data->color[1]=  "#334bd2";
$data->color[2]=  "#FF401A";

$result[9] = $data->result();?>
<div class="container-fluid main-container">
<div class="col col-12 col-md-12 col-lg-12 col-xs-12">
	<div class="row">
	<div class="col-md-3 col-3 col-xs-12  id0">
	<div class="card card-default shadow">
		<div class="card-body">
		<span> </span>
			<?php echo $result[0];?>
		</div>
	</div>
	</div>
	<div class="col-md-3 col-3 col-xs-12 offset-md-3 id1">
	<div class="card card-default shadow">
		<div class="card-body">
		<span> </span>
			<?php echo $result[1];?>
		</div>
	</div>
	</div>
	<div class="col-md-3 col-3 col-xs-12 offset-md-6 id2">
	<div class="card card-default shadow">
		<div class="card-body">
		<span> </span>
			<?php echo $result[2];?>
		</div>
	</div>
	</div>
	<div class="col-md-3 col-3 col-xs-12 offset-md-9 id3">
	<div class="card card-default shadow">
		<div class="card-body">
		<span> </span>
			<?php echo $result[3];?>
		</div>
	</div>
	</div>
	</div>
	<div class="row">
	<div class="col-md-3 col-3 col-xs-12  id4">
	<div class="card card-default shadow">
		<div class="card-body">
		<span>Stack Chart</span>
			<?php echo $result[4];?>
		</div>
	</div>
	</div>
	<div class="col-md-4 col-4 col-xs-12 offset-md-3 id5">
	<div class="card card-default shadow">
		<div class="card-body">
		<span>Bubble Chart</span>
			<?php echo $result[5];?>
		</div>
	</div>
	</div>
	<div class="col-md-5 col-5 col-xs-12 offset-md-7 id6">
	<div class="card card-default shadow">
		<div class="card-body">
		<span>Area Chart</span>
			<?php echo $result[6];?>
		</div>
	</div>
	</div>
	</div>
	<div class="row">
	<div class="col-md-4 col-4 col-xs-12  id7">
	<div class="card card-default shadow">
		<div class="card-body">
		<span>Donut Chart</span>
			<?php echo $result[7];?>
		</div>
	</div>
	</div>
	<div class="col-md-5 col-5 col-xs-12 offset-md-4 id8">
	<div class="card card-default shadow">
		<div class="card-body">
		<span>Map Chart</span>
			<?php echo $result[8];?>
		</div>
	</div>
	</div>
	<div class="col-md-3 col-3 col-xs-12 offset-md-9 id9">
	<div class="card card-default shadow">
		<div class="card-body">
		<span>Bar Chart</span>
			<?php echo $result[9];?>
		</div>
	</div>
	</div>
	</div>
</div>
</div>

</body>
