
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

<div class="col-lg-12">
<div class="panel panel-default">
	<div class="panel-heading">
	&nbsp;
		<a data-toggle="modal" class="close" aria-label="Close" href="layoutsetting.php?layout=3&col=0" data-target="#myModal"><div class="fa fa-gear"></div></a>
	</div>
	<div class="panel-body">
			<?php echo $result[0];?>
	</div>
	<!-- Modal -->
	<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->

</div>
</div>

<div class="row">
<div class="col-lg-6">
<div class="panel panel-default">
	<div class="panel-heading">
	&nbsp;
		<a data-toggle="modal" class="close" aria-label="Close" href="layoutsetting.php?layout=3&col=1" data-target="#myModal"><div class="fa fa-gear"></div></a>
	</div>
	<div class="panel-body" >
			<?php echo $result[1];?>
	</div>
	<!-- Modal -->
	<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->

</div>
</div>

<div class="col-lg-6">
<div class="panel panel-default">
	<div class="panel-heading">
	&nbsp;
		<a data-toggle="modal" class="close" aria-label="Close" href="layoutsetting.php?layout=3&col=2" data-target="#myModal"><div class="fa fa-gear"></div></a>
	</div>
	<div class="panel-body">
			<?php echo $result[2];?>
	</div>
	<!-- Modal -->
	<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
			</div> <!-- /.modal-content -->
		</div> <!-- /.modal-dialog -->
	</div> <!-- /.modal -->

</div>
</div>
</div>