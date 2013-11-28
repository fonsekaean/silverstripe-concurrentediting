<?php
/**
 * @package concurrentediting
 */
class ConcurrentEditingLeftAndMain extends Extension {

	static $edit_timeout = 10;
	static $page_ping_interval = 300;
	static $overwrite_display_duration = 20;

	function onAfterInit() {
		Requirements::javascript('concurrentediting/javascript/ConcurrentEditing.js');
		Requirements::css('concurrentediting/css/styles.css');
	}

}

class ConcurentEditingLeftAndMain_Controller extends Controller {

	static $allowed_actions = array(
		'concurrentEditingPing'
	);

	static $edit_timeout = 10;
	static $page_ping_interval = 3;
	static $overwrite_display_duration = 20;

	function concurrentEditingPing() {
		$arrRet = array(
			'status' => 'not_found'
		);

		if(isset($_REQUEST['lastedit']) && isset($_REQUEST['Object']) && isset($_REQUEST['ID']) && $_REQUEST['Object']!= "item"){
			$arrData = Convert::raw2sql($_REQUEST);
			$strLastEditted = $arrData['lastedit'];
			$strClassName = $arrData['Object'];
			$iID = intval($arrData['ID']);


			$object = DataList::create($strClassName)->byID($iID);

			if($object){

				$editorDetails = ConcurrentEditingDataObject::GetConcurrentEditorsDataObject($strClassName, $iID);

				$member = Member::currentUser();
				$arrCurrentlyEditing = $editorDetails->UsersCurrentlyEditing ? unserialize($editorDetails->UsersCurrentlyEditing) : array();
				$iNumberOfEditors = count($arrCurrentlyEditing);
				$strKey = 'M_' . $member->ID;

				if(!array_key_exists($strKey, $arrCurrentlyEditing)){
					$arrCurrentlyEditing[$strKey] = array(
						'Name'		 => $member->getName(),
						'LastEdited' => DateUtils::MYSQLDateTime(DateUtils::CurrentDateTime())
					);
				}

				// check who else is editing.
				$arrNames = array();
				foreach($arrCurrentlyEditing as $strCurrentKey => $arrEditor){
					if($strCurrentKey != $strKey){
						$arrNames[] = $arrEditor['Name'];
					}
				}
				$arrRet = array(
					'status' => 'Notediting',
					'names' => $arrNames,
					'isLastEditor' => false,
					'edit' => true,
					'editId'=>	$editorDetails->LastEditedByID
				);

				if ($object->LastEditedByID == $member->ID) {
					$arrRet['isLastEditor'] = True;
				}
				if(count($arrNames)){
					$arrRet['status']='editing';
				}
				if($object->LastEdited == $strLastEditted){
					$arrRet['edit']=false;
				}

				$arrValidMembers = array();
				// delete the old pings from
				$dtTimeOut = DateUtils::AddMinutesToDate(DateUtils::CurrentDateTime(), self::$edit_timeout * -1);
				foreach($arrCurrentlyEditing as $strKey => $arrEditor){
					$dtCurrentTime = DateUtils::MysqlDateTimeToPHPTime($arrEditor['LastEdited']);
					if($dtCurrentTime >= $dtTimeOut){
						$arrValidMembers[$strKey] = $arrEditor;
					}
				}

				if($iNumberOfEditors != count($arrValidMembers)){
					$editorDetails->UsersCurrentlyEditing = serialize($arrValidMembers);
					$editorDetails->write();
				}
			}

		}

		return Convert::array2json($arrRet);

	}


}