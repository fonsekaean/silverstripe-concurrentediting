<?php
/**
 * Created by Nivanka Fonseka (nivanka@silverstripers.com).
 * User: nivankafonseka
 * Date: 11/28/13
 * Time: 3:41 PM
 * To change this template use File | Settings | File Templates.
 */

class DataObjectEditor extends DataObject {

	public static $db = array(
		'UsersCurrentlyEditing'	=> 'Text',
		'ObjectClass'			=> 'Varchar(100)',
		'ObjectID'				=> 'Int'
	);

	public static $has_one = array(
		'LastEditedBy' => 'Member'
	);

	public static $defaults = array(
		'SaveCount' => '0'
	);

}