import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import classes from './ViewNote.module.css';

import Table from 'react-bootstrap/Table';

class ViewNote extends Component {
    state = {
        noteData: {
            title: null,
            description: null,
            createdAt: null,
            updatedAt: null,
            sharedUsers: []
        }
    }

    componentDidMount = () => {
        axios.get('http://localhost:5000/api/notes/' + this.props.match.params.nid + '?auth=' + this.props.token)
            .then(response => {
                this.setState({noteData: response.data.note});
            })
            .catch(error => {
                console.log(error);
            })
    }

    render () {
        return (
            <div className={classes.Container}>
                <h3 className={classes.Title}>Details</h3>
                <Table className={classes.Table} variant="dark">
                    <tbody>
                        <tr>
                            <td>Title</td>
                            <td>{this.state.noteData.title}</td>
                        </tr>
                        <tr>
                            <td>Description</td>
                            <td>{this.state.noteData.description}</td>
                        </tr>
                        <tr>
                            <td>Created Date</td>
                            <td>{this.state.noteData.createdAt}</td>
                        </tr>
                        <tr>
                            <td>Updated Date</td>
                            <td>{this.state.noteData.updatedAt}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        token: state.auth.token
    }
}

export default connect(mapStateToProps)(ViewNote);