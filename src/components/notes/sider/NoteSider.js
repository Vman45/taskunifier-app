import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Menu, Popconfirm } from 'antd';
import Icon from 'components/common/Icon';
import withObjects from 'containers/WithObjects';
import withApp from 'containers/WithApp';
import { FolderPropType } from 'proptypes/FolderPropTypes';
import { NoteFilterPropType } from 'proptypes/NoteFilterPropTypes';
import LeftRight from 'components/common/LeftRight';
import Constants from 'constants/Constants';
import { Menu as RCMenu, Item as RCItem, MenuProvider as RCMenuProvider } from 'react-contexify';
import { getGeneralNoteFilters, createSearchNoteFilter } from 'data/DataNoteFilters';
import { Tooltip } from 'antd';
import Spacer from 'components/common/Spacer';

function NoteSider(props) {
    const [openKeys, setOpenKeys] = useState(['general']);

    const onSelect = event => {
        props.setSelectedNoteFilter(event.item.props.filter);
    };

    const onOpenChange = keys => {
        setOpenKeys(keys);
    };

    const createCategorySubMenu = (text, icon, onAdd) => {
        return (
            <LeftRight right={onAdd ? (
                <Icon
                    icon="plus"
                    color={Constants.fadeColor}
                    className="object-actions"
                    onClick={() => onAdd()} />
            ) : null}>
                <Icon icon={icon} text={text} />
            </LeftRight>
        );
    };

    const createObjectContextMenu = (object, onAdd, onEdit, onDelete) => {
        return (
            <RCMenu id={'menu_' + object.id}>
                {onAdd ? (
                    <RCItem onClick={() => onAdd()}>
                        <Icon icon="plus" text="Add" />
                    </RCItem>
                ) : null}
                {onEdit ? (
                    <RCItem onClick={() => onEdit()}>
                        <Icon icon="edit" text="Edit" />
                    </RCItem>
                ) : null}
            </RCMenu>
        );
    };

    const createEditDeleteButtons = (object, onEdit, onDelete) => {
        return (
            <React.Fragment>
                <Icon
                    icon="edit"
                    color={Constants.fadeColor}
                    className="object-actions"
                    onClick={() => onEdit()} />
                <Spacer />
                <Popconfirm
                    title={`Do you really want to delete "${object.title}" ?`}
                    onConfirm={() => onDelete()}
                    okText="Yes"
                    cancelText="No">
                    <Icon
                        icon="trash-alt"
                        color={Constants.fadeColor}
                        className="object-actions" />
                </Popconfirm>
            </React.Fragment>
        );
    };

    const createObjectMenuItem = (object, noteFilter, onAdd, onEdit, onDelete) => {
        return (
            <Menu.Item key={object.id} filter={noteFilter}>
                <RCMenuProvider id={'menu_' + object.id}>
                    <div>
                        <LeftRight right={createEditDeleteButtons(object, onEdit, onDelete)}>
                            <Icon icon="circle" color={object.color} text={object.title} />
                        </LeftRight>
                    </div>
                </RCMenuProvider>
                {createObjectContextMenu(object, onAdd, onEdit, onDelete)}
            </Menu.Item>
        );
    };

    const addObject = category => {
        props.setCategoryManagerOptions({
            visible: true,
            category: category
        });
    };

    const editObject = (category, objectId) => {
        props.setCategoryManagerOptions({
            visible: true,
            category: category,
            objectId: objectId
        });
    };

    const addNoteFilter = () => {
        props.setNoteFilterManagerOptions({
            visible: true
        });
    };

    const editNoteFilter = noteFilterId => {
        props.setNoteFilterManagerOptions({
            visible: true,
            noteFilterId: noteFilterId
        });
    };

    const createNoteFilterForObject = (object, field, condition = {
        id: '1',
        field: field,
        type: 'equal',
        value: object.id
    }) => {
        return {
            id: object.id,
            title: object.title,
            color: object.color,
            condition: condition
        };
    };

    const onSearch = value => {
        props.setSelectedNoteFilter(createSearchNoteFilter(value));
    };

    const searchNoteFilter = createSearchNoteFilter();

    return (
        <React.Fragment>
            <Menu
                selectedKeys={[props.selectedNoteFilter.id]}
                openKeys={openKeys}
                onSelect={onSelect}
                onOpenChange={onOpenChange}
                mode="inline"
                style={{ height: '100%' }}>
                <Menu.Item
                    key={searchNoteFilter.id}
                    filter={searchNoteFilter}>
                    <Icon
                        icon={searchNoteFilter.icon}
                        text={(
                            <Tooltip title="Press enter to search" placement="bottom">
                                <Input.Search
                                    allowClear={true}
                                    size="small"
                                    placeholder="Search for ..."
                                    style={{ width: '80%' }}
                                    onSearch={value => onSearch(value)} />
                            </Tooltip>
                        )} />
                </Menu.Item>
                <Menu.SubMenu key="general" title={<Icon icon="home" text="General" />}>
                    {getGeneralNoteFilters().map(noteFilter => (
                        <Menu.Item
                            key={noteFilter.id}
                            filter={noteFilter}>
                            <Icon
                                icon={noteFilter.icon}
                                color={noteFilter.color}
                                text={noteFilter.title} />
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>
                <Menu.SubMenu key="folders" title={createCategorySubMenu('Folders', 'folder', () => addObject('folders'))}>
                    {props.folders.map(folder => createObjectMenuItem(
                        folder,
                        createNoteFilterForObject(folder, 'folder'),
                        () => addObject('folders'),
                        () => editObject('folders', folder.id),
                        () => props.deleteFolder(folder.id)))}
                </Menu.SubMenu>
                <Menu.SubMenu key="tags" title={createCategorySubMenu('Tags', 'tag', null)}>
                    {props.tags.map(tag => createObjectMenuItem(
                        tag,
                        createNoteFilterForObject(tag, 'tags', {
                            id: '1',
                            field: 'tags',
                            type: 'contain',
                            value: tag.id
                        }),
                        null,
                        () => editObject('tags', tag.id),
                        () => props.deleteTag(tag.id)))}
                </Menu.SubMenu>
                <Menu.SubMenu key="noteFilters" title={createCategorySubMenu('Note Filters', 'filter', () => addNoteFilter())}>
                    {props.noteFilters.map(noteFilter => createObjectMenuItem(
                        noteFilter,
                        noteFilter,
                        () => addNoteFilter(),
                        () => editNoteFilter(noteFilter.id),
                        () => props.deleteNoteFilter(noteFilter.id)))}
                </Menu.SubMenu>
            </Menu >
        </React.Fragment>
    );
}

NoteSider.propTypes = {
    selectedNoteFilter: NoteFilterPropType.isRequired,
    folders: PropTypes.arrayOf(FolderPropType).isRequired,
    noteFilters: PropTypes.arrayOf(NoteFilterPropType).isRequired,
    setSelectedNoteFilter: PropTypes.func.isRequired,
    setCategoryManagerOptions: PropTypes.func.isRequired,
    setNoteFilterManagerOptions: PropTypes.func.isRequired,
    deleteFolder: PropTypes.func.isRequired,
    deleteNoteFilter: PropTypes.func.isRequired
};

export default withApp(withObjects(NoteSider, {
    includeActions: true,
    includeNoteFilters: true,
    includeFolders: true,
    includeTags: true,
    filterArchivedFolders: true
}));