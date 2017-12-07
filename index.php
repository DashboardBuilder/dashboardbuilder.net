<?php 
$folder = "";
include('lib/top.php');?>
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
					<li class="active"><a href="index.php"?><span class="fa fa-home"></span> Home</a></li>
					
					<!-- Dropdown-->
					<li class="active panel panel-default" id="dropdown">
						<a data-toggle="collapse" href="#dropdown-lvl1">
							<span class="fa fa-th"></span> Layout <span class="caret"></span>
						</a>

						<!-- Dropdown level 1 -->
						<div id="dropdown-lvl1" class="panel-collapse collapse">
							<div class="panel-body">
								<ul class="nav navbar-nav">
									<li><a href="lib/layout.php?col=1&p=0">One Column</a></li>
									<li><a href="lib/layout.php?col=2&p=1">Two Column</a></li>
									<li><a href="lib/layout.php?col=2&p=2">Tow Column II</a></li>			
									<li><a href="lib/layout.php?col=3&p=1">Three Column</a></li>		
									<li><a href="lib/layout.php?col=3&p=2">Three Column II</a></li>			
									<li><a href="lib/layout.php?col=4&p=0">Four Column</a></li>					
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
								
									<li><a href="lib/new.php?loc=lib/" data-toggle="modal" data-target="#dashModal"><span class="fa fa-file-o"></span> New</a></li>
									<li><a data-toggle="modal" data-target="#dashModal" href="lib/open.php?loc=lib/"><span class="fa fa-folder-open-o"><span> Open</a></li>	
									<li><a data-toggle="modal" data-target="#dashModal" href="lib/save.php?<?php echo $param;?>" <?php echo $able;?> ><span class="fa fa-floppy-o"></span> Save</a></li>
									<li class="active panel panel-default" id="dropdown">
										<a data-toggle="collapse" href="#dropdown-v3">
											<span class="fa fa-cogs"></span> Generate <span class="caret"></span>
										</a>
										<div id="dropdown-v3" class="panel-collapse collapse">
											<div class="panel-body">
												<ul class="nav navbar-nav">
													<li><a href="lib/codegenerate.php?<?php echo $param;?>"  <?php echo $able;?>><span class="fa fa-code"></span> PHP Code</a></li>
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

	
	
		<h1>Build your dashboard in a minute, no programming skill requried.</h2>
		<h3> Dashboard Builder helps you to build your dashboard in 4 easy steps.</h3>
		<div class="row">
					
			<div class="col-md-4 col-md-offset-4">
			<a href="#" onclick="changeVideo('GvqdSRTDdeI')"><button class="btn-lg btn-danger" >Take a Tour</button></a>
			</div>

<!-- Modal -->
<div class="modal fade" id="youtube" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-body">
      
        <iframe id="iframeYoutube" width="560" height="315"  src="https://www.youtube.com/embed/GvqdSRTDdeI" frameborder="0" allowfullscreen></iframe> 
        
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
<!-- Moodal -->


		
		<div class="col-lg-12">
			<div class="col-lg-6">
				<img src="assets/img/step1.jpg" style="height:50%; width:50%;"/>
			</div>	
			
			
			<div class="col-lg-6">
				<img src="assets/img/step2.jpg" style="height:50%; width:50%;"/>
			</div>
		</div>
		<p>&nbsp;</p>
		<div class="col-lg-12">
			<div class="col-lg-6">
				<img src="assets/img/step3.jpg" style="height:50%; width:50%;"/>
			</div>
			<div class="col-lg-6">
				<img src="assets/img/step4.jpg" style="height:50%; width:50%;"/>
			</div>
		</div>
		</div>
	

<?php include ('lib/bottom.php');?>
<script>
$(document).ready(function(){
  $("#youtube").on("hidden.bs.modal",function(){
    $("#iframeYoutube").attr("src","#");
  })
})

function changeVideo(vId){
  var iframe=document.getElementById("iframeYoutube");
  iframe.src="https://www.youtube.com/embed/"+vId;

  $("#youtube").modal("show");
}
</script>