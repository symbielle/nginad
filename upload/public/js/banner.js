var currentZones = {};
var completeZoneList = {};

var iabSizes = '<select id="iabsize" name="iabsize" onchange="formSelectSize(this);">'
    			+ '<option selected="selected" value="">[ SELECT A SIZE ]</option>'
    			+ '<option value="468x60">IAB Full Banner (468 x 60)</option>'
    			+ '<option value="120x600">IAB Skyscraper (120 x 600)</option>'
    			+ '<option value="728x90">IAB Leaderboard (728 x 90)</option>'
    			+ '<option value="120x90">IAB Button 1 (120 x 90)</option>'
    			+ '<option value="120x60">IAB Button 2 (120 x 60)</option>'
    			+ '<option value="234x60">IAB Half Banner (234 x 60)</option>'
    			+ '<option value="88x31">IAB Micro Bar (88 x 31)</option>'
    			+ '<option value="125x125">IAB Square Button (125 x 125)</option>'
    			+ '<option value="120x240">IAB Vertical Banner (120 x 240)</option>'
    			+ '<option value="180x150">IAB Rectangle (180 x 150)</option>'
    			+ '<option value="300x250">IAB Medium Rectangle (300 x 250)</option>'
    			+ '<option value="336x280">IAB Large Rectangle (336 x 280)</option>'
    			+ '<option value="240x400">IAB Vertical Rectangle (240 x 400)</option>'
    			+ '<option value="250x250">IAB Square Pop-up (250 x 250)</option>'
    			+ '<option value="160x600">IAB Wide Skyscraper (160 x 600)</option>'
    			+ '<option value="720x300">IAB Pop-Under (720 x 300)</option>'
    			+ '<option value="300x100">IAB 3:1 Rectangle (300 x 100)</option>'
    			+ '<option value="-">Custom</option>'
    			+ '</select>';

var mobilePhoneSizes = '<select id="iabsize" name="iabsize" onchange="formSelectSize(this);">'
				+ '<option selected="selected" value="">[ SELECT A SIZE ]</option>'
				+ '<option value="320x50">Mobile Phone Banner (320 x 50)</option>'
				+ '<option value="300x50">Mobile Phone Thin Banner (300 x 50)</option>'
				+ '<option value="300x250">Mobile Phone Medium Rectangle (300 x 250)</option>'
				+ '<option value="320x480">Mobile Phone Full Screen (320 x 480)</option>'
				+ '<option value="300x480">Mobile Phone Thin Full Screen (300 x 480)</option>'
    			+ '<option value="-">Custom</option>'
    			+ '</select>';

var mobileTabletSizes = '<select id="iabsize" name="iabsize" onchange="formSelectSize(this);">'
				+ '<option selected="selected" value="">[ SELECT A SIZE ]</option>'
				+ '<option value="728x90">Mobile Tablet Leaderboard (728 x 90)</option>'
				+ '<option value="300x250">Mobile Tablet Medium Rectangle (300 x 250)</option>'
				+ '<option value="300x50">Mobile Tablet Banner (300 x 50)</option>'
				+ '<option value="728x1024">Mobile Tablet Full Screen (728 x 1024)</option>'
				+ '<option value="-">Custom</option>'
				+ '</select>';

function formSelectSize (elem) {

		if($(elem).val() == "" || $(elem).val() == "-") {
			$("#width").val("");
			$("#height").val("");
		}
		var hw = $(elem).val().split("x");

		if (hw.length == 2) {
			$("#width").val(hw[0]);
			$("#height").val(hw[1]);
		}

}

function switchMobile (elem) {

	var mobileType = $(elem).val();

	if (mobileType == 2) {
		$("#size-select").html(mobileTabletSizes);
	} else if (mobileType > 0) {
		$("#size-select").html(mobilePhoneSizes);
	} else {
		$("#size-select").html(iabSizes);
	}
}

function switchAdCampaignType() {
	
	var adCampaignType = $("#adcampaigntype :selected").text();

	if (adCampaignType == "Contract") {
		getZonesDataAndPopulate();
	} else {
		$("#zone-picker").hide();
	}
}

function populateZones() {
	var height 			= $("#height").val();
	var width 			= $("#width").val();
	if (height && width) {
		populateZonesSelect();
	} else {
		$("#weight-box").hide();
		$("#zone-picker").html("");
		$("#zone-picker").hide();
	}
}

function hasCurrentZone(currentZoneArray, currentZone) {

	for (var key in currentZoneArray) {
		if (currentZoneArray[key] == currentZone) {
			return true;
		}
	}

	return false;
}

function registerZones() {

	currentZones = "";
	var comma = "";

	$("#linkedzones option:selected").each(
			function() {
				currentZones += comma + $(this).val();
				comma = ",";
			}
	);

}

function getZonesDataAndPopulate() {
	
	$("#adcampaigntype").prop("disabled", true);
	
	var ispreview		= $("input[name='ispreview']").val();
	var campaignId 		= "";
	var previewParam 	= "false";
	if (ispreview == 1) {
		bannerId 		= $("input[name='bannerpreviewid']").val();
		previewParam 	= "true";
	} else {
		bannerId 		= $("input[name='bannerid']").val();
	}
	
	var height 			= $("#height").val();
	var width 			= $("#width").val();

	if (!height || !width) {
		alert("Select banner dimensions first, choose a height and width.");
		$("#zone-picker").hide();
		$("#adcampaigntype").val(1);
		$("#adcampaigntype").prop("disabled", false);
		return false;
	}

	var campaignParam = bannerParam = "";
	
	if (bannerId && bannerId != 'undefined') {
		bannerParam = bannerId;
	}
	
	if (!completeZoneList[width+'x'+height]) {
		$.get("/demand/editlinkedzone/" + bannerParam + "?height=" + height + "&width=" + width + "&is_preview=" + previewParam, function( data ) {
			$("#zone_no_btn").attr("disabled",false);
			if(data.success == false) {
				alert("There are no Publisher Zones that match this demand campaign banner");
				$("#zone-picker").hide();
				$("#adcampaigntype").val(1);
				$("#adcampaigntype").prop("disabled", false);
				return false;
			}
			
			if(data.success == true) {
				
				currentZones = data.linked_ad_zones;
				completeZoneList[width+'x'+height] = data.complete_zone_list;
				populateZonesSelect(data.complete_zone_list);
			
			}
			
		},'json');
	} else {
		populateZonesSelect(completeZoneList[width+'x'+height]);
	}
}

function populateZonesSelect(complete_zone_list) {
	var selectZonesPre = '<select id="linkedzones" name="linkedzones[]"  onchange="registerZones();" multiple style="min-height: 200px">';
	var selectZones = "";
	var foundZone = false;
	var currentZoneArray = currentZones.split(",");
	var height 			= $("#height").val();
	var width 			= $("#width").val();
	
	for (i = 0; i < complete_zone_list.length; i++) {
		
		var current_zone = complete_zone_list[i];
		var ad_name = current_zone.ad_name + " - " + width + "x" + height;
		if (hasCurrentZone(currentZoneArray, current_zone.zone_id) == true) {
			foundZone = true;
			selectZones += '<option value="' + current_zone.zone_id + '" selected="selected">' + ad_name + '</option>';
		} else {
			selectZones += '<option value="' + current_zone.zone_id + '">' + ad_name + '</option>';
		}
	}
	selectZones += '</select>';

	var allSelectZones = selectZonesPre;
	if (foundZone == false) {
		allSelectZones += '<option value="" selected="selected">Choose Zones</option>';
	}
	allSelectZones += selectZones;
	
	$("#adcampaigntype").prop("disabled", false);
	$("#weight-box").show();
	var header = '<div id="choose-zones">Choose Zones to Associate to this Banner:</div>';
	allSelectZones = header + allSelectZones;
	$("#zone-picker").html(allSelectZones);
	$("#zone-picker").show();
}

$().ready(function() {

	switchAdCampaignType();
});