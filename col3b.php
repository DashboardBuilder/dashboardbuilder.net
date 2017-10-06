<ol class="breadcrumb">
	<li>
		<i class="fa fa-home"></i>  <a href="index.php"> Home</a>
	</li>
	<li>
		<i class="fa fa-th"></i> Layout
	</li>
	<li class="active">
		Three Column II
	</li>
</ol>
<?php $xmlfile = 'data/data.xml';
	 $xmlDoc=simplexml_load_file($xmlfile);
	 $connectionstatus="";
?>
<div class="col-lg-6">
<div class="panel panel-default">
	<div class="panel-heading">
	&nbsp;
	
	
	<div style="float:left; ">
	<form   id="form0" method="post" action="<?php echo $_SERVER['REQUEST_URI'];?>">
	<input type="hidden" name="node"  value="0">
	<input type="hidden" name="layout" value="3">
	<input type="hidden" name="click" value="true">
	<button type="submit" class="close" ><div class="fa fa-gear"></div></button>
	</form>
	</div>
	 <?php
	 $connectionstatus='<sub><div class="fa fa-close" style="color:#FF0000;" ></div></sub><div class="fa fa-database"></div>';
	 if ($xmlDoc->col0->dbconnected== '1'){
	 	$connectionstatus='<sub><div class="fa fa-check" style="color:#009933;" ></div></sub><div class="fa fa-database"></div>';
		}

		if ($xmlDoc->col0->source== 'upload'){
			if (file_exists($xmlDoc->col0->file)) {
				$connectionstatus='<div class="fa fa-file-excel-o" style="color:#669933;"></div>';
			}
		}
	  ?>
		<a data-toggle="modal" class="close" aria-label="Close" href="dbsetting.php?layout=3&col=0" data-target="#dbModal-0"><?php echo $connectionstatus;?></a>
	</div>
	<div class="panel-body result">
			<?php echo $result[0];?>
	</div>
	<!-- Modal -->
	<div class="modal fade" id="dbModal-0" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->
	
	<!-- Modal -->
	<div class="modal fade in" id="settingModal-0" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
			<?php
			if (isset($_POST['node'])){
			if ($_POST['node']=="0"){
		    $_GET['col']=0;
			$_GET['layout']=3;
				include ('layoutsetting.php');
			}}?>			
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->

</div>
</div>

<!-- Modal 2 -->



<div class="col-lg-6">
<div class="panel panel-default">
	<div class="panel-heading">
	&nbsp;
	
	
	<div style="float:left; ">
	<form   id="form0" method="post" action="<?php echo $_SERVER['REQUEST_URI'];?>">
	<input type="hidden" name="node"  value="1">
	<input type="hidden" name="layout" value="3">
	<input type="hidden" name="click" value="true">
	<button type="submit" class="close" ><div class="fa fa-gear"></div></button>
	</form>

	</div>
	<?php
	 $connectionstatus='<sub><div class="fa fa-close" style="color:#FF0000;" ></div></sub><div class="fa fa-database"></div>';
	 if ($xmlDoc->col1->dbconnected== '1'){
	 	$connectionstatus='<sub><div class="fa fa-check" style="color:#009933;" ></div></sub><div class="fa fa-database"></div>';
		}

		if ($xmlDoc->col1->source== 'upload'){
			if (file_exists($xmlDoc->col1->file)) {
				$connectionstatus='<div class="fa fa-file-excel-o" style="color:#669933;"></div>';
			}
		}
	  ?>
		<a data-toggle="modal" class="close" aria-label="Close" href="dbsetting.php?layout=3&col=1" data-target="#dbModal-1"> <?php echo $connectionstatus;?></a>
	</div>
	<div class="panel-body result">
			<?php echo $result[1];?>
	</div>
	<!-- Modal -->
	<div class="modal fade" id="dbModal-1" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->
	
	<!-- Modal -->
	<div class="modal fade in" id="settingModal-1" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
			<?php
			if (isset($_POST['node'])){
			if ($_POST['node']=="1"){
		    $_GET['col']=1;
			$_GET['layout']=3;
				include ('layoutsetting.php');
			}}?>	
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->

</div>
</div>

<!-- Modal 3 -->


<div class="col-lg-12">
<div class="panel panel-default">
	<div class="panel-heading">
	&nbsp;
	
	
	<div style="float:left; ">
	<form   id="form0" method="post" action="<?php echo $_SERVER['REQUEST_URI'];?>">
	<input type="hidden" name="node"  value="2">
	<input type="hidden" name="layout" value="3">
	<input type="hidden" name="click" value="true">
	<button type="submit" class="close" ><div class="fa fa-gear"></div></button>
	</form>
		
	</div>
	 <?php
	 $connectionstatus='<sub><div class="fa fa-close" style="color:#FF0000;" ></div></sub><div class="fa fa-database"></div>';
	 if ($xmlDoc->col2->dbconnected== '1'){
	 	$connectionstatus='<sub><div class="fa fa-check" style="color:#009933;" ></div></sub><div class="fa fa-database"></div>';
		}

		if ($xmlDoc->col2->source== 'upload'){
			if (file_exists($xmlDoc->col2->file)) {
				$connectionstatus='<div class="fa fa-file-excel-o" style="color:#669933;"></div>';
			}
		}
	  ?>
		<a data-toggle="modal" class="close" aria-label="Close" href="dbsetting.php?layout=3&col=2" data-target="#dbModal-2"><?php echo $connectionstatus;?></a>
	</div>
	<div class="panel-body result">
			<?php echo $result[2];?>
	</div>
	<!-- Modal -->
	<div class="modal fade" id="dbModal-2" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->
	
	<!-- Modal -->
	<div class="modal fade in" id="settingModal-2" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
			<?php
			if (isset($_POST['node'])){
			if ($_POST['node']=="2"){
		    $_GET['col']=2;
			$_GET['layout']=3;
				include ('layoutsetting.php');
			}}?>	
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->

</div>
</div>



<?php if (isset($_POST['click'])) {
$_POST["click"]= array();
?>
<script>
	$('#settingModal-<?php echo $_POST["node"];?>').modal('show');
</script>
<?php }?>

<?php

if ((isset($_POST['runquery'])=='true') || (isset($_POST['save'])=='true')) {
?>
<script>
<!-- second modal -->
     $('#settingModal-<?php echo $_POST["node"];?>').modal('show');
</script>
<?php		
} 
?>


