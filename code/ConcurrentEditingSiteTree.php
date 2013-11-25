<?php
/**
 * @package concurrentediting
 */
class ConcurrentEditingSiteTree extends DataExtension {

    static $db = array(
        'SaveCount' => 'Int'
    );

    static $has_one = array(
        'LastEditedBy' => 'Member'
    );

    static $defaults = array(
        'SaveCount' => '0'
    );

    static $many_many = array(
        'UsersCurrentlyEditing' => 'Member'
    );

    static $many_many_extraFields = array(
        'UsersCurrentlyEditing' => array(
            'LastPing' => 'SS_Datetime'
        )
    );

	
	function updateCMSFields(FieldList $fields) {
		$alert = new LiteralField("SiteTree_Alert", '<div
			deletedfromstage="'.((int) $this->owner->getIsDeletedFromStage()).'"
			savecount="'.$this->owner->SaveCount.'"
			id="SiteTree_Alert"
			pagepinginterval="' . ConcurrentEditingLeftAndMain::$page_ping_interval . '"
			overwritedisplayduration="' . ConcurrentEditingLeftAndMain::$overwrite_display_duration . '"
			class="message"
		></div>');
		$fields->insertBefore($alert, 'Title');
	}

	function onBeforeWrite() {
		if($this->owner->isChanged()) $this->owner->LastEditedByID = Member::currentUserID();
	}
}
