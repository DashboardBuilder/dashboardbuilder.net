<?php 
/**
 * DashboardBuilder
 *
 * @author Diginix Technologies www.diginixtech.com
 * Support <support@dashboardbuider.net> - https://www.dashboardbuilder.net
 * @copyright (C) 2016-2026 Dashboardbuilder.net
 * @version 8.2
 * @license: Must read and agree LICENSE.txt before use.
 */

/* App code. Relative to lib/ (core.php keeps the working folder there). */
define('FOLDER', "../");

/* Writable folders: data/, store/ and output */

$db_userdata = getenv('DB_USERDATA');
if ($db_userdata === false || $db_userdata === '') {
	$db_userdata = isset($_SERVER['DB_USERDATA']) ? (string) $_SERVER['DB_USERDATA'] : '';
}
if ($db_userdata !== '') {
	define('USERDATA', rtrim(str_replace('\\', '/', $db_userdata), '/') . '/');
	define("DATA", USERDATA . "data/");
	define("STORE", USERDATA . "store/");
	define("OUTPUT", USERDATA . "output/");
	define("DATA_DIR", DATA);
} else {
	define('USERDATA', '');
	define("DATA", FOLDER . "data/");
	define("STORE", FOLDER . "store/");
	define("OUTPUT", FOLDER . "output/");
	define("DATA_DIR", __DIR__ . "/data/");   // absolute: for code that does not run from lib/
}
unset($db_userdata);
