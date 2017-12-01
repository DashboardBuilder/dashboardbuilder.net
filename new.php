<?php 

if (isset($_GET['task'])) {
		if ($_GET["task"]=='open'){
			$newfile = 'data'.DIRECTORY_SEPARATOR.'data.xml';
			$file = 'data'.DIRECTORY_SEPARATOR.'empty'.DIRECTORY_SEPARATOR.'data.xml';
			
			if (!copy($file, $newfile)) {
				echo "failed to copy $file...\n";
			}
			header('Location: ' . $_SERVER["HTTP_REFERER"] );
		}
}
?>
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <title>File New</title>  
</head>
<body>
 <!-- Modal -->
 
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true" onclick="javascript:window.location.reload()">&times;</button>
		 <h4 class="modal-title">Open a New Dashboard</h4>
	</div>			
	<!-- Tab Panel Ends -->
	<form  id="newfile" class="form-horizontal" action="new.php?task=open" method="post">
	<br/>
	
	<div class="col-sm-12">
	<h3>Are you sure? You want to open a New Dashboard?</h3>
		<br/>
	</div><br/><br/><br/><br/><br/>

	
	<div class="modal-footer">
		<button type="button" class="btn btn-primary"  data-dismiss="modal" onclick="javascript:window.location.reload()">No</button>
		<button type="submit" class="btn btn-default"  style="float:right;">Yes</button>
	</div>
</form>
</body>
</html>

