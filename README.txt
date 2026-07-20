REQUIREMENTS
-------------------------
    PHP Version 7.1 or later
    Apache 2 or later
    Windows 7 or later /Linux 3 or later
    Firefox 52, Chrome 57, IE 8


INSTALLATION 
------------

INSTALLER
.........

1) Extract the product archive in web root. e.g. www/dashboarduilder
2) Open it in browser to run installer. e.g. http://localhost/ dashboarduilder

INTEGRATION
-----------
- For integration in your app, you need to copy the PHP code to your php application.

1) The folder "inc", “assets” and “css” will be replaced by path where you place 'lib' folder (if changed)

	<script src="assets/js/dashboard.min.js"></script>  <! --  copy this file to assets/js folder -- > 
	<link rel="stylesheet" href="css/bootstrap.min.css"> <! --  Bootstrap CSS file, change the path accordingly -- >

2) Update include path where you place “inc/dashboard_dist.php”. (if changed)

	Include(“inc/dashboard_dist.php");
Refer 'Getting Started' section on https://dashboardbuilder.net/documentation for more details.

Refer 'Support' on https://dashboardbuilder.net/support for queries and support.

LICENSE
-------
Must read and agree LICENSE.txt before use.
