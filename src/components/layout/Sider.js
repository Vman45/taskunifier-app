import React, { useState } from 'react';
import { Menu, Popconfirm } from 'antd';
import Icon from '../common/Icon';
import withContexts from '../../containers/WithContexts';
import withFilters from '../../containers/WithFilters';
import withFolders from '../../containers/WithFolders';
import withGoals from '../../containers/WithGoals';
import withLocations from '../../containers/WithLocations';
import withApp from '../../containers/WithApp';
import LeftRight from '../common/LeftRight';

function Sider(props) {
    const [openKeys, setOpenKeys] = useState(['general']);

    const onSelect = event => {
        props.setSelectedFilter({
            id: event.key,
            title: event.key
        });
    };

    const onOpenChange = keys => {
        setOpenKeys(keys);
    };

    const createCategorySubMenu = (text, icon, onAdd) => {
        return (
            <LeftRight right={<Icon
                icon="plus"
                color="#eaeff7"
                className="object-actions"
                onClick={() => onAdd()} />}>
                <Icon icon={icon} text={text} />
            </LeftRight>
        );
    }

    const createEditDeleteButtons = (object, onEdit, onDelete) => {
        return (
            <React.Fragment>
                <Icon
                    icon="edit"
                    color="#e3f2eb"
                    className="object-actions"
                    onClick={() => onEdit()} />
                <Popconfirm
                    title={`Do you really want to delete "${object.title}" ?`}
                    onConfirm={() => onDelete()}
                    okText="Yes"
                    cancelText="No">
                    <Icon
                        icon="trash-alt"
                        color="#e3f2eb"
                        className="object-actions" />
                </Popconfirm>
            </React.Fragment>
        );
    }

    const createObjectMenuItem = (object, onEdit, onDelete) => {
        return (
            <Menu.Item key={object.id}>
                <LeftRight right={createEditDeleteButtons(object, onEdit, onDelete)}>
                    <Icon icon="circle" color={object.color} text={object.title} />
                </LeftRight>
            </Menu.Item>
        );
    }

    return (
        <Menu
            selectedKeys={[props.selectedFilter.id]}
            openKeys={openKeys}
            onSelect={onSelect}
            onOpenChange={onOpenChange}
            mode="inline">
            <Menu.SubMenu key="general" title={<Icon icon="home" text="General" />}>
                <Menu.Item key="not-completed">{<Icon icon="check" text="Not Completed" />}</Menu.Item>
                <Menu.Item key="due-today">{<Icon icon="calendar-alt" text="Due Today" />}</Menu.Item>
                <Menu.Item key="overdue">{<Icon icon="bomb" text="Overdue" />}</Menu.Item>
                <Menu.Item key="hot-list">{<Icon icon="pepper-hot" text="Hot List" />}</Menu.Item>
                <Menu.Item key="importance">{<Icon icon="exclamation-triangle" text="Importance" />}</Menu.Item>
                <Menu.Item key="starred">{<Icon icon="star" text="Starred" />}</Menu.Item>
                <Menu.Item key="next-action">{<Icon icon="chevron-circle-right" text="Next Action" />}</Menu.Item>
                <Menu.Item key="completed">{<Icon icon="check-double" text="Completed" />}</Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="folders" title={createCategorySubMenu("Folders", "folder", () => props.setCategoryManagerVisible(true))}>
                {props.folders.map(folder => createObjectMenuItem(folder, () => { }, () => props.deleteFolder(folder.id)))}
            </Menu.SubMenu>
            <Menu.SubMenu key="contexts" title={createCategorySubMenu("Contexts", "thumbtack", () => { })}>
                {props.contexts.map(context => createObjectMenuItem(context, () => { }, () => props.deleteContext(context.id)))}
            </Menu.SubMenu>
            <Menu.SubMenu key="goals" title={createCategorySubMenu("Goals", "bullseye", () => { })}>
                {props.goals.map(goal => createObjectMenuItem(goal, () => { }, () => props.deleteGoal(goal.id)))}
            </Menu.SubMenu>
            <Menu.SubMenu key="locations" title={createCategorySubMenu("Locations", "compass", () => { })}>
                {props.locations.map(location => createObjectMenuItem(location, () => { }, () => props.deleteLocation(location.id)))}
            </Menu.SubMenu>
            <Menu.SubMenu key="tags" title={createCategorySubMenu("Tags", "tag", () => { })}>
            </Menu.SubMenu>
            <Menu.SubMenu key="filters" title={createCategorySubMenu("Filters", "filter", () => { })}>
                {props.filters.map(filter => createObjectMenuItem(filter, () => { }, () => props.deleteFilter(filter.id)))}
            </Menu.SubMenu>
        </Menu >
    );
}

export default withApp(withContexts(withFilters(withFolders(withGoals(withLocations(Sider))))));