import React, { useState } from 'react';
import { Badge, Input, Menu, Tooltip } from 'antd';
import Icon from 'components/common/Icon';
import LeftRight from 'components/common/LeftRight';
import ObjectMenuItem from 'components/sider/ObjectMenuItem';
import Constants from 'constants/Constants';
import { getGeneralNoteFilters } from 'data/DataNoteFilters';
import { useAppApi } from 'hooks/UseAppApi';
import { useFolderApi } from 'hooks/UseFolderApi';
import { useNoteFilterApi } from 'hooks/UseNoteFilterApi';
import { useNoteApi } from 'hooks/UseNoteApi';
import { useSettingsApi } from 'hooks/UseSettingsApi';
import { useTagApi } from 'hooks/UseTagApi';

function NoteSider() {
    const appApi = useAppApi();
    const folderApi = useFolderApi();
    const noteApi = useNoteApi();
    const noteFilterApi = useNoteFilterApi();
    const settingsApi = useSettingsApi();
    const tagApi = useTagApi();

    const [searchValue, setSearchValue] = useState(noteApi.searchNoteValue);

    const openKeys = settingsApi.settings.noteSiderOpenKeys;

    const setOpenKeys = openKeys => {
        settingsApi.updateSettings({
            noteSiderOpenKeys: openKeys
        });
    };

    const onSelect = event => {
        noteApi.setSelectedNoteFilter(event.item.props.filter);
    };

    const onOpenChange = key => {
        const newOpenKeys = [...openKeys];

        if (newOpenKeys.includes(key)) {
            newOpenKeys.splice(newOpenKeys.indexOf(key), 1);
        } else {
            newOpenKeys.push(key);
        }

        setOpenKeys(newOpenKeys);
    };

    const createCategorySubMenu = (text, icon, onManage, onOpenChange) => {
        return (
            <LeftRight
                onClickLeft={onOpenChange}
                right={onManage ? (
                    <Icon
                        icon="cubes"
                        color={Constants.fadeIconColor}
                        className="object-actions"
                        onClick={() => onManage()} />
                ) : null}>
                <Icon icon={icon} text={text} />
            </LeftRight>
        );
    };

    const manageObjects = category => {
        appApi.setCategoryManagerOptions({
            visible: true,
            category
        });
    };

    const editObject = (category, objectId) => {
        appApi.setCategoryManagerOptions({
            visible: true,
            category,
            objectId
        });
    };

    const dropObject = (note, object, property) => {
        noteApi.updateNote({
            ...note,
            [property]: object.id
        });
    };

    const manageNoteFilters = () => {
        appApi.setNoteFilterManagerOptions({
            visible: true
        });
    };

    const editNoteFilter = noteFilterId => {
        appApi.setNoteFilterManagerOptions({
            visible: true,
            noteFilterId
        });
    };

    const createNoteFilterForObject = (object, field, condition = {
        id: null,
        field,
        type: 'equal',
        value: object.id
    }) => {
        return {
            id: object.id,
            title: object.title,
            color: object.color,
            condition,
            sorters: settingsApi.settings.categoryNoteSorters
        };
    };

    const createBadge = noteFilter => {
        if (noteFilter.id !== noteApi.selectedNoteFilter.id) {
            return null;
        }

        return (
            <Badge
                count={noteApi.filteredNotes.length}
                showZero={true}
                overflowCount={9999}
                style={{
                    backgroundColor: Constants.badgeColor,
                    fontWeight: 'bold',
                    marginLeft: 10,
                    marginBottom: 2
                }} />
        );
    };

    return (
        <div
            className="joyride-note-sider"
            style={{ backgroundColor: '#ffffff', height: '100%' }}>
            <div style={{ padding: 10 }}>
                <Icon
                    icon="search"
                    text={(
                        <Tooltip title="Press enter to search" placement="bottom">
                            <Input.Search
                                value={searchValue}
                                allowClear={true}
                                size="small"
                                placeholder="Search for ..."
                                style={{ width: '90%' }}
                                onChange={event => setSearchValue(event.target.value)}
                                onSearch={value => noteApi.setSearchNoteValue(value)}
                                onKeyDown={event => {
                                    if (event.key === 'Escape') {
                                        setSearchValue('');
                                        noteApi.setSearchNoteValue('');
                                    }
                                }} />
                        </Tooltip>
                    )} />
            </div>
            <Menu
                selectedKeys={[noteApi.selectedNoteFilter.id]}
                openKeys={openKeys}
                onSelect={onSelect}
                mode="inline">
                <Menu.SubMenu
                    key="general"
                    title={<Icon icon="home" text="General" />}
                    onTitleClick={({ key }) => onOpenChange(key)}>
                    {getGeneralNoteFilters().map(noteFilter => (
                        <Menu.Item
                            key={noteFilter.id}
                            filter={noteFilter}>
                            <LeftRight right={createBadge(noteFilter)}>
                                <Icon
                                    icon={noteFilter.icon}
                                    color={noteFilter.color}
                                    text={noteFilter.title} />
                            </LeftRight>
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>
                <Menu.SubMenu
                    key="folders"
                    title={createCategorySubMenu('Folders', 'folder', () => manageObjects('folders'), () => onOpenChange('folders'))}>
                    {folderApi.folders.map(folder => {
                        const filter = createNoteFilterForObject(folder, 'folder');

                        return (
                            <Menu.Item key={folder.id} filter={filter}>
                                <ObjectMenuItem
                                    badge={createBadge(filter)}
                                    object={folder}
                                    onManage={() => manageObjects('folders')}
                                    onEdit={() => editObject('folders', folder.id)}
                                    onDelete={() => folderApi.deleteFolder(folder.id)}
                                    dropType="note"
                                    onDrop={(note, folder) => dropObject(note, folder, 'folder')} />
                            </Menu.Item>
                        );
                    })}
                </Menu.SubMenu>
                <Menu.SubMenu
                    key="tags"
                    title={createCategorySubMenu('Tags', 'tag', () => manageObjects('tags'), () => onOpenChange('tags'))}>
                    {tagApi.tags.map(tag => {
                        const filter = createNoteFilterForObject(tag, 'tags', {
                            id: null,
                            field: 'tags',
                            type: 'contain',
                            value: [tag.id]
                        });

                        return (
                            <Menu.Item key={tag.id} filter={filter}>
                                <ObjectMenuItem
                                    badge={createBadge(filter)}
                                    object={tag}
                                    onManage={() => manageObjects('tags')}
                                    onEdit={() => editObject('tags', tag.id)}
                                    onDelete={() => tagApi.deleteTag(tag.id)} />
                            </Menu.Item>
                        );
                    })}
                </Menu.SubMenu>
                <Menu.SubMenu
                    key="noteFilters"
                    title={createCategorySubMenu('Note Filters', 'filter', () => manageNoteFilters(), () => onOpenChange('noteFilters'))}>
                    {noteFilterApi.noteFilters.map(noteFilter => (
                        <Menu.Item key={noteFilter.id} filter={noteFilter}>
                            <ObjectMenuItem
                                badge={createBadge(noteFilter)}
                                object={noteFilter}
                                onManage={() => manageNoteFilters()}
                                onEdit={() => editNoteFilter(noteFilter.id)}
                                onDelete={() => noteFilterApi.deleteNoteFilter(noteFilter.id)} />
                        </Menu.Item>
                    ))}
                </Menu.SubMenu>
            </Menu >
        </div>
    );
}

export default NoteSider;