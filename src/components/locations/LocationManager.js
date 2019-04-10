import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Empty } from 'antd';
import withLocations from '../../containers/WithLocations';
import LocationList from './LocationList';
import LocationForm from './LocationForm';

function LocationManager(props) {
    const selectedLocationId = props.locationId;

    const onAddLocation = follocationder => {
        props.addLocation(location).then(id => props.onLocationSelection(id));
    }

    const onLocationSelection = location => {
        props.onLocationSelection(location.id);
    }

    const selectedLocation = props.locations.find(location => location.id === selectedLocationId);

    return (
        <Row>
            <Col span={6}>
                <LocationList
                    locations={props.locations}
                    selectedLocationId={selectedLocationId}
                    addLocation={onAddLocation}
                    deleteLocation={props.deleteLocation}
                    onLocationSelection={onLocationSelection} />
            </Col>
            <Col span={2}>

            </Col>
            <Col span={16}>
                {selectedLocation ? (
                    <LocationForm key={selectedLocationId} location={selectedLocation} updateLocation={props.updateLocation} />
                ) : <Empty description="Please select a location" />}
            </Col>
        </Row>
    );
}

LocationManager.propTypes = {
    locationId: PropTypes.string,
    onLocationSelection: PropTypes.func.isRequired
}

export default withLocations(LocationManager);