
<meta charset="utf-8" />

<meta http-equiv="X-UA-Compatible" content="IE=edge" />

<meta name="author" content="Sylvia Koppermann" />
<meta name="copyright" content="Astrotel Internetmarketing GmbH" />
<meta name="publisher" content="Astrotel Internetmarketing GmbH" />
<meta name="siteinfo" content="robots.txt" />
<meta name="language" content="de" />

<meta name="robots" content="index,follow" />


<link rel="alternate" hreflang="de" href="http://www.hotel-edison.de/" />
<link itemprop="url" href="http://www.hotel-edison.de/" />
<link rel="canonical" href="http://www.hotel-edison.de/" />
<link href="https://plus.google.com/b/116904582506891831777/+HoteledisonDeImOstseebadKühlungsbornMVP/" rel="publisher" />

<link rel="shortcut icon" type="image/x-icon" href="fav.ico">

<link type="text/css" href="style/style.css" rel="stylesheet" media="screen" />
<link type="text/css" rel="stylesheet" href="font_awesome/css/font-awesome.min.css" />
<link type="text/css" rel="stylesheet" href="lightslider/css/lightslider.css" />

<meta name="viewport" content="width=device-width, initial-scale=1" />

<script type="text/javascript" src="../js/jquery.js"></script>
<script type="text/javascript" src="../js/jqueryui.js"></script>
<script type="text/javascript" src="lightslider/js/lightslider.js"></script>

<script type="text/javascript" src="js/edison_mobile.js"></script>

<script type="text/javascript">
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
	
	ga('create', 'UA-50984323-1', 'auto');
	ga('set', 'anonymizeIp', true);
	ga('send', 'pageview');
</script><?php
	
	//include($_SERVER['DOCUMENT_ROOT']."/edison/cms/admin.php");

/*	 	PREISE 
	
		1: 	Winter & Meer
			Jan., Feb., Nov., Dez.
			
		2:	Ahoi Kühlungsborn
			Mär., Apr., Okt.
			
		3:	Baltic Flair
			Mai, Jun., Sep.
			
		4:	Erlebnis Ostsee
			Jul., Aug.
		
		a:	mit Arr.-Vorteil
		
	min_a:	ab wie vielen Tagen erhält man den Arr.-Vorteil
*/

	$kosten_hp	= 20;
	
	//Preistabelle Zimmernamen
	$zimmername		= array("Doppelzimmer Classic",
							"Doppelzimmer Classic Plus",
							"Doppelzimmer Comfort",
							"Junior Appartement",
							"Senior Appartement",
							"Panorama Suite");
							
	$zimmervar		= array("doppel_classic",
							"doppel_classic_plus",
							"doppel_comfort",
							"junior_app",
							"senior_app",
							"suite");
		
	//Doppelzimmer Classic
		
		$doppel_classic_1 	= 38;
		$doppel_classic_1a	= 44.5;
		
		$doppel_classic_2 	= 45;
		$doppel_classic_2a	= 50;
		
		$doppel_classic_3 	= 55;
		$doppel_classic_3a	= 64;
		
		$doppel_classic_4 	= 58;
		$doppel_classic_4a	= 70;
		
		$doppel_classic_5a 	= 249;
		$doppel_classic_6a	= 225;
		$doppel_classic_7a	= 357;
	
	//Doppelzimmer Classic Plus

		$doppel_classic_plus_1 		= 39;
		$doppel_classic_plus_1a		= 47.5;
		
		$doppel_classic_plus_2 		= 48;
		$doppel_classic_plus_2a		= 55;
		
		$doppel_classic_plus_3 		= 60;
		$doppel_classic_plus_3a		= 69;
		
		$doppel_classic_plus_4 		= 65;
		$doppel_classic_plus_4a		= 75;
		
		$doppel_classic_plus_5a 	= 264;
		$doppel_classic_plus_6a		= 234;
		$doppel_classic_plus_7a		= 372;
		
		
	//Doppelzimmer Comfort

		$doppel_comfort_1 	= 46;
		$doppel_comfort_1a	= 49.5;
		
		$doppel_comfort_2 	= 53;
		$doppel_comfort_2a	= 60;
		
		$doppel_comfort_3 	= 67;
		$doppel_comfort_3a	= 74;
		
		$doppel_comfort_4 	= 72;
		$doppel_comfort_4a	= 80;
		
		$doppel_comfort_5a 	= 279;
		$doppel_comfort_6a	= 255;
		$doppel_comfort_7a	= 387;
		
		
	//Junior Appartement

		$junior_app_1 		= 52;
		$junior_app_1a		= 66;
		
		$junior_app_2 		= 59;
		$junior_app_2a		= 74;
		
		$junior_app_3 		= 76;
		$junior_app_3a		= 79;
		
		$junior_app_4 		= 81;
		$junior_app_4a		= 95;
		
		$junior_app_5a 		= 285;
		$junior_app_6a		= 285;
		$junior_app_7a		= 417;
	
	
	//Senior Appartement

		$senior_app_1 		= 57;
		$senior_app_1a		= 66;
		
		$senior_app_2 		= 64;
		$senior_app_2a		= 74;
		
		$senior_app_3 		= 81;
		$senior_app_3a		= 79;
		
		$senior_app_4 		= 86;
		$senior_app_4a		= 95;
		
		$senior_app_5a 		= 285;
		$senior_app_6a		= 285;
		$senior_app_7a		= 417;
		
		
	//Panorama Suite

		$suite_1 		= 69;
		$suite_1a		= 70;
		
		$suite_2 		= 75;
		$suite_2a		= 78;
		
		$suite_3 		= 88;
		$suite_3a		= 90;
		
		$suite_4 		= 95;
		$suite_4a		= 111;
		
		$suite_5a 		= 300;
		$suite_6a		= 300;
		$suite_7a		= 432;
		
		
	
	//-- ARRANGEMENTS UND FEIERTAGSANGEBOTE --//
		
		$monate			= array("Januar",
								"Februar",
								"März",
								"April",
								"Mai",
								"Juni",
								"Juli",
								"August",
								"September",
								"Oktober",
								"November",
								"Dezember");

		$anzahl_arr		= 4; //für Trennung zw Arr und Feiertagsangeboten

		$reihenfolge 	= array("4", "3", "2", "1", "6", "7", "5");


		$headline 		= array("Winter &amp; Meer",
								"Ahoi Kühlungsborn",
								"Baltic Flair",
								"Erlebnis Ostsee",
								
								"Frohe Ostern",
								"Ho Ho Ho",
								"Salut 2017");
							
							
		$subheadline 	= array("Schneegestöber an der Ostsee",
								"Steife Brise an der Küste",
								"Zeit für Meer",
								"Ihre Urlaubsidee",
								
								"Den Frühling schnuppern",
								"Weihnachten an der Ostsee",
								"Silvesterparty an der Seebrücke");


		$img_name		= array("winter_meer",
								"ahoi_kuehlungsborn",
								"baltic_flair",
								"erlebnis_ostsee",
								
								"ostern",
								"weihnachten",
								"silvester");
								
			
		$buchbarkeit	= array("Januar, Februar, November, Dezember, außer an Feiertagen",
								"März, April, Oktober, außer an Feiertagen",
								"Mai, Juni, September, außer an Feiertagen",
								"Juli, August, außer an Feiertagen",
								
								"25.03.2016",
								"23.12.2016",
								"29.12.2016/30.12.2016");
								
		$buchbarkeit_s	= array("Jan., Feb., Nov., Dez.",
								"Mär., Apr., Okt.",
								"Mai, Jun., Sep.",
								"Jul., Aug.",
								
								"25.03.2016",
								"23.12.2016",
								"29.12.2016/30.12.2016");

		$preis_folgejahr= array("1",
								"1",
								"1",
								"1",
								
								"1",
								"1",
								"1"); /* 1 -> für Folgejahr gültig */

		$dauer			= array("2",
								"3",
								"3",
								"5",
								
								"3",
								"3",
								"3");
								

		$verlaengerbar	= array("1",
								"1",
								"1",
								"1",
								
								"0",
								"0",
								"0");
								
								
		$fixpreis		= array("0",
								"0",
								"0",
								"0",
								
								"1",
								"1",
								"1");
								

		$beschreibung	= array("<li><strong>ab ".$dauer[0]." Übernachtungen</strong></li>
								<li>EDISON Frühstücksbuffet</li>
								<li>Halbpension</li>
								<li class='li_leer'></li>",

								"<li><strong>ab ".$dauer[1]." Übernachtungen</strong></li>
								<li>EDISON Frühstücksbuffet</li>
								<li>Vitamingruß</li>
								<li>Halbpension (3 Gang Menü)</li>",
								
								"<li><strong>ab ".$dauer[2]." Übernachtungen</strong></li>
								<li>Begrüßungssekt</li>
								<li>EDISON Frühstücksbuffet</li>
								<li>Halbpension (3 Gang Menü)</li>",
								
								"<li><strong>ab ".$dauer[3]." Übernachtungen</strong></li>
								<li>Begrüßungscocktail</li>
								<li>EDISON Frühstücksbuffet</li>
								<li>Halbpension (3 Gang Menü)</li>",
								
								
								"<li class='li_leer'></li>
								<li><strong>3 Übernachtungen</strong></li>
								<li>Ostercocktail</li>
								<li>EDISON Frühstücksbuffet</li>
								<li>Karfreitagsmenü</li>
								<li>Osterfestmenü</li>
								<li>Schlemmerbuffet</li>
								<li class='li_leer'></li>
								<li class='li_leer'></li>",
								
								"<li><strong>3 Übernachtungen</strong></li>
								<li>EDISON Frühstücksbuffet</li>
								<li>Begrüßungsmenü</li>
								<li>Kaffeegedeck mit weihnachtlicher Musik</li>
								<li>Glühweingutschein</li>
								<li>Festliches Weihnachtsmenü</li>
								<li>Schlemmerbuffet</li>
								<li>Sauna frei</li>",
								
								"<li><strong>3 Übernachtungen<br />(Donnerstag bis Sonntag<br />oder Freitag bis Montag)</strong></li>
								<li>Silvestercocktail</li>
								<li>EDISON Frühstücksbuffet</li>
								<li>Willkommensmenü</li>
								<li>Gala-Dinner ohne Silvesterfeier</li>
								<li>Katerfrühstück mit Sekt</li>
								<li>Neujahrsabendmenü</li>");
							
							
		$bg_farbe		= array("#00567c",
								"#1c8eb5",
								"#019fae",
								"#bca860",
								
								"#e3b000",
								"#006300",
								"#6f0000");
		
		
	function preis_format($preis){
		
		return number_format ( $preis , 2 , "," , "." );
	}
	?>