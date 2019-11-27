import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import classes from './NotesList.module.css';

import Table from 'react-bootstrap/Table';

class NotesList extends Component {
    state = {
        myNotes: [],
        sharedNotes: []
    }

    componentDidMount = () => {
        axios.get('http://localhost:5000/api/notes/user/' + this.props.userId + '?auth=' + this.props.token)
            .then(response => {
                this.setState({myNotes: response.data.notes});
            })
            .catch(error => {
                console.log(error);
            })
    }

    viewNoteHandler = (noteId) => {
        this.props.history.push("/notes/" + noteId);
    }

    render () {
        return (
            <div className={classes.Container}>
                <h3 className={classes.Title}>My Notes</h3>
                <Table className={classes.Table} variant="dark" hover>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Created Date</th>
                            <th className={classes.LgTableField}>Description</th>
                            <th className={classes.LgTableField}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.myNotes.map(note => {
                            return (
                                <tr onClick={() => this.viewNoteHandler(note._id)} key={note._id}>
                                    <td>{note.title}</td>
                                    <td>{note.createdAt}</td>
                                    <td className={classes.LgTableField}>{note.description}</td>
                                    <td className={classes.LgTableField}>edit | delete</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
                <h3 className={classes.Title}>Shared Notes</h3>
                <Table className={classes.Table} variant="dark" hover>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Creator</th>
                            <th className={classes.LgTableField}>Description</th>
                            <th className={classes.LgTableField}>Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.sharedNotes.map(note => {
                            return (
                                <tr>
                                    <td>{note.title}</td>
                                    <td>{note.creator}</td>
                                    <td className={classes.LgTableField}>{note.description}</td>
                                    <td className={classes.LgTableField}>{note.createdAt}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        userId: state.auth.userId
    }
}

export default connect(mapStateToProps)(NotesList);