	<?php
	if (isset($_GET['savetask'])) {
		if ($_GET["savetask"]=='save'){
	    	savefile($_REQUEST['col'],$_REQUEST['p']);
			header('Location: ' . $_SERVER["HTTP_REFERER"] );
		}
	}
	?>
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <title>File Save</title>  
</head>
<body>

 <!-- Modal -->
 
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true" onclick="javascript:window.location.reload()">&times;</button>
		 <h4 class="modal-title">File Save</h4>
	</div>			<!-- /modal-header -->

	
	<!-- Tab Panel Ends -->
	<form  id="savefil" class="form-horizontal" action="save.php?savetask=save&col=<?php echo $_GET['col'];?>&p=<?php echo $_GET['p'];?>" method="post">
	<br/>
	<label class="col-sm-3 control-label">File Name:</label> 
		<div class="col-sm-offset-3">
	   <input type="text" id="filename" name="filename" value="" placeholder="salesq1"size="50" required oninvalid="this.setCustomValidity('Please enter a file name')" oninput="setCustomValidity('')" />    
	</div><br/>
	
	<div class="col-sm-6">
	<select size="5" class="form-control col-sm-offset-6" >
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
		<button type="submit" class="btn btn-primary">Save</button>
	</div>
</form>
</body>
</html>
<?php
function savefile($col, $p){
$file = 'data'.DIRECTORY_SEPARATOR.'data.xml';
$newfile = 'store'.DIRECTORY_SEPARATOR.$_POST['filename'].'.c'.$col.'p'.$p;

if (!copy($file, $newfile)) {
    echo "failed to copy $file...\n";
}
}
?>
