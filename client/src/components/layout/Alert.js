import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const Alert = ({ alerts }) => 
    alerts !== null && 
    alerts.length > 0 && 
    alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
            { alert.msg }
        </div>
    )
);

Alert.propTypes = {
    alerts: PropTypes.array.isRequired,
}

//Function is to retrieve the alerts from the state from the alert reducer
const mapStateToProps = state => ({
    alerts: state.alert
})

export default connect(mapStateToProps)(Alert)