<?php
/**
 * @package concurrentediting
 */
class ConcurrentEditingDataObject extends DataExtension {

	function updateCMSFields(FieldList $fields) {
		if(get_class($this->owner) != "DataObjectEditor"){
			$alert = new LiteralField("SiteTree_Alert", '<div
			deletedfromstage="0"
			lastedit="'.$this->owner->LastEdited.'"
			id="SiteTree_Alert"
			pagepinginterval="' . ConcurrentEditingLeftAndMain::$page_ping_interval . '"
			overwritedisplayduration="' . ConcurrentEditingLeftAndMain::$overwrite_display_duration . '"
			class="sitetreeeditor"
		></div>');
			$fields->addFieldToTab('Root.Main', $alert);
		}


		return $fields;
	}

	function onBeforeWrite() {
		if(get_class($this->owner) != "DataObjectEditor" && $this->owner->ID){
			$editors = ConcurrentEditingDataObject::GetConcurrentEditorsDataObject(get_class($this->owner), $this->owner->ID);
			$editors->LastEditedBy = Member::currentUserID();
		}
	}

	static function GetConcurrentEditorsDataObject($strClassName, $iID){

		$editorDetails = DataObjectEditor::get()->filter(array(
			'ObjectClass'	=> $strClassName,
			'ObjectID'		=> $iID
		))->first();
		if(!$editorDetails){
			$editorDetails = new DataObjectEditor(array(
				'ObjectClass'	=> $strClassName,
				'ObjectID'		=> $iID
			));
			$editorDetails->write();
		}
		return $editorDetails;

	}

}
