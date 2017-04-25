<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <title>File Open</title>  
</head>
<body>

 <!-- Modal -->
 
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true" onclick="javascript:window.location.reload()">&times;</button>
		 <h4 class="modal-title">File Open</h4>
	</div>			<!-- /modal-header -->
	<?php
	if (isset($_GET['opentask'])) {
		if ($_GET["opentask"]=='open'){
	    	openfile($_REQUEST['filename']);
			$p=substr($_REQUEST['filename'], -1);
			$c=substr($_REQUEST['filename'],-3,1);
			header('Location: layout.php?col='.$c.'&p='.$p );
		}
	}
	?>
	
	<!-- Tab Panel Ends -->
	<form  id="savefil" class="form-horizontal" action="open.php?opentask=open" method="post">
	<br/>
	<label class="col-sm-3 control-label">File Name:</label> 
	
	<div class="col-sm-7">
	<select  name="filename" class="form-control col-sm-offset-2" size="5">
	   <?php
 		 $search = "store".DIRECTORY_SEPARATOR."*.c?p?";
		 foreach (glob($search) as $filename) {
					$patterns = '/store/';
					$replacements = '';
					$filename= preg_replace($patterns, $replacements, $filename);
					echo '<option value="'. $filename.'">'.preg_replace('/.c1p0|.c2p1|.c2p2|.c3p1|.c3p2|.c4p0/','',$filename) .'</option>';
				}

		?>    
		</select>
		<br/>
	</div><br/><br/><br/><br/><br/>

	<div class="modal-footer">
		<button type="button" class="btn btn-default" data-dismiss="modal" onclick="javascript:window.location.reload()">Cancel</button>
		<button type="submit" class="btn btn-primary">Open</button>
	</div>
</form>
</body>
</html>
<?php
function openfile($filename){

$newfile = 'data'.DIRECTORY_SEPARATOR.'data.xml';
$file = 'store'.DIRECTORY_SEPARATOR.$filename;

if (!copy($file, $newfile)) {
    echo "failed to copy $file...\n";
}
}
?>
