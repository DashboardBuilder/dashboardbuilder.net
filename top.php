<?php $xml=simplexml_load_file("data/version.xml") or die("Error: Cannot create object");;?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<title>Dashboard Builder</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
<link rel="stylesheet" href="assets/css/bootstrap.min.css">
<link rel="stylesheet" href="css/font-awesome.min.css">
<link rel="stylesheet" href="css/style_v1.css">

</head>

<body>
<nav class="navbar navbar-default navbar-static-top">
    <div class="container-fluid">
		<!-- Brand and toggle get grouped for better mobile display -->
		<div class="navbar-header">
			<button type="button" class="navbar-toggle navbar-toggle-sidebar collapsed">
			MENU
			</button>
			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<a class="navbar-brand" href="#" style="margin-top:-20px; ">
				<img src="assets/img/dashboardbuilder_logo.png"/>
			</a>
		</div>

		<!-- Collect the nav links, forms, and other content for toggling -->
		<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">      
			<ul class="nav navbar-nav navbar-right">
				<li class="dropdown ">
					<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
						<span class="fa fa-question-circle" style="font-size:2em; " ></span>
						<span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li class=""><a href="http://www.dashboardbuilder.net/documentation">Documentation</a></li>
							<li class=""><a href="http://www.dashboardbuilder.net/support">Support</a></li>
							<li class=""><a href="http://www.dashboardbuilder.net/contactus">Contact us</a></li>
							<li><a href="http://www.dashboardbuilder.net" target="_blank">Visit Site</a></li>
							<li class="divider"></li>
							<li><a href="#" style="pointer-events: none;">Version:<?php echo $xml->version; ?></a></li>
							<li><a href="#" style="pointer-events: none;">Type:<?php echo $xml->type; ?></a></li>
						</ul>
					</li>
				</ul>
			</div><!-- /.navbar-collapse -->
		</div><!-- /.container-fluid -->
	</nav> 
