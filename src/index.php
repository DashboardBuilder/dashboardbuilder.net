<?php 
session_start();
// prerequisite 
$prer="";
if(ini_get('allow_url_fopen') ) {
		//  do nothing
		} else {
	    $prer =  'allow_url_fopen is disabled. How to <a href="https://dashboardbuilder.net/enable-allow-url-fopen" style="color:#fff;">enable?</a> ';
	}

if (extension_loaded('simplexml')) {
	// do nothing
} else {
		$prer =  $prer. '<br/>SampleXML is not installed. How to <a href="https://dashboardbuilder.net/how-to-install-simplexml" style="color:#fff;">install?</a> ';
}

if (extension_loaded('openssl')) {
		//  do nothing
		} else {
		$xmlinfo=simplexml_load_file('data/version.xml');
		if (isset($_REQUEST['legacy'])) {
		   if ($_REQUEST['legacy']=="Yes") {
			   $xmlinfo->legacy ="Yes";
			   $xmlinfo->asXML('data/version.xml');
			}
		}
			
		if ($xmlinfo->legacy !="Yes") {
			$prer =  $prer.  'OpenSSL is not installed or disabled. How to <a href="https://dashboardbuilder.net/how-to-install-openssl" style="color:#fff;">enable?</a> <br/>
			To continue without OpenSSL - the software will run in Legacy mode wihout SSL <a href="./?legacy=Yes" style="color:#fff;">Continue?</a> ';
		}
}

if (!(PHP_VERSION_ID >= 70200)) {
    $prer =  $prer. 'The Dashboard Builder dependencies require a PHP version >= 7.2.0". You are running ' . PHP_VERSION . '.';
}


if ( !(is_writable("data") )) {
	$prer = $prer. "Error! Folder /data/ is not writeable. Read-Write permission to folders and sub-folders of dashboardbuilder i.e chmod -R 774 dashbboardbuilder ";
}



if (!empty($prer)) {
	?>
	<style>
	.alert {
	  padding: 20px;
	  background-color: #f44336; /* Red */
	  color: white;
	  margin-bottom: 15px;
	  text-align:center;
	}

	/* The close button */
	.closebtn {
	  margin-left: 15px;
	  color: white;
	  font-weight: bold;
	  float: right;
	  font-size: 22px;
	  line-height: 20px;
	  cursor: pointer;
	  transition: 0.3s;
	}

	/* When moving the mouse over the close button */
	.closebtn:hover {
	  color: black;
	}
	</style>
	 <div class="alert">
	  <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
	  <?php echo $prer;?>
	</div> 
		<?php
		die;
}
// prerequisite end
if(isset($_REQUEST['share'])) {
	header('Location: lib/dashboard.php?file='.$_REQUEST['share']);
	exit();
} else {
header('Location: lib');
exit();
}
?>
