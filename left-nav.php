<?php 
$param = '';
$able = 'class="disabled"'. '  style="color:#CCCCCC;"';
if (isset($_REQUEST['col'])){
if (!empty($_REQUEST['col'])){
		 $param = 'col='.$_REQUEST['col'].'&p='.$_REQUEST['p'];
		 $able = '';
	}
}
?>
<style>
.disabled {
   pointer-events: none;
   cursor: default;
}
</style>
									
<div class="container-fluid main-container">
  		<div class="col-md-2 sidebar">
  			<div class="row">
	<!-- uncomment code for absolute positioning tweek see top comment in css -->
	<div class="absolute-wrapper"> </div>
	<!-- Menu -->
	<div class="side-menu">
<nav class="navbar navbar-default" role="navigation">
			<!-- Main Menu -->
			<div class="side-menu-container">
				<ul class="nav navbar-nav">
					<li class="active"><a href="index.php"><span class="fa fa-home"></span> Home</a></li>
					
					<!-- Dropdown-->
					<li class="active panel panel-default" id="dropdown">
						<a data-toggle="collapse" href="#dropdown-lvl1">
							<span class="fa fa-th"></span> Layout <span class="caret"></span>
						</a>

						<!-- Dropdown level 1 -->
						<div id="dropdown-lvl1" class="panel-collapse collapse">
							<div class="panel-body">
								<ul class="nav navbar-nav">
									<li><a href="layout.php?col=1&p=0">One Column</a></li>
									<li><a href="layout.php?col=2&p=1">Two Column</a></li>
									<li><a href="layout.php?col=2&p=2">Tow Column II</a></li>			
									<li><a href="layout.php?col=3&p=1">Three Column</a></li>		
									<li><a href="layout.php?col=3&p=2">Three Column II</a></li>			
									<li><a href="layout.php?col=4&p=0">Four Column</a></li>					
								</ul>
							</div>
						</div>
					</li>
					
					<!-- Dropdown dashboard-->
					<li class="active panel panel-default" id="dropdown">
						<a data-toggle="collapse" href="#dropdown-v2">
							<span class="fa fa-bar-chart-o"></span> Dashboard <span class="caret"></span>
						</a>

						<!-- Dropdown level 1 -->
						<div id="dropdown-v2" class="panel-collapse collapse">
							<div class="panel-body">
								<ul class="nav navbar-nav" >
									<li><a href="new.php" data-toggle="modal" data-target="#dashModal"><span class="fa fa-file-o"></span> New</a></li>
									<li><a data-toggle="modal" data-target="#dashModal" href="open.php"><span class="fa fa-folder-open-o"><span> Open</a></li>	
									<li><a data-toggle="modal" data-target="#dashModal" href="save.php?<?php echo $param;?>" <?php echo $able;?> ><span class="fa fa-floppy-o"></span> Save</a></li>
									<li class="active panel panel-default" id="dropdown">
										<a data-toggle="collapse" href="#dropdown-v3">
											<span class="fa fa-cogs"></span> Generate <span class="caret"></span>
										</a>
										<div id="dropdown-v3" class="panel-collapse collapse">
											<div class="panel-body">
												<ul class="nav navbar-nav">
													<li><a href="codegenerate.php?<?php echo $param;?>"  <?php echo $able;?>><span class="fa fa-code"></span> PHP Code</a></li>
												</ul>
											</div>
										</div>
									</li>
								</ul>
							</div>
						</div>
					</li>
				</ul>
			</div><!-- /.navbar-collapse -->
		</nav>
		</div>
</div>  		</div>
  		<div class="col-md-10 content">
  			  <div>
	<div >
	</div>
	<div >