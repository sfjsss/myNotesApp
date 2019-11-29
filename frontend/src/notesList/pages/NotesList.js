import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

import classes from './NotesList.module.css';

import Table from 'react-bootstrap/Table';

class NotesList extends Component {
    state = {
        myNotes: [],
        deletedNotes: [],
        sharedNotes: [],
        showDeletedNotes: false
    }

    componentDidMount = () => {
        this.updateNotes();
    }

    updateNotes = () => {
        axios.get('http://localhost:5000/api/notes/user/' + this.props.userId + '?auth=' + this.props.token)
            .then(response => {
                console.log(response.data);
                let updatedMyNotes = [];
                let updatedDeletedNotes = [];
                response.data.notes.forEach(note => {
                    if (note.deleted) {
                        updatedDeletedNotes.push(note);
                    } else {
                        updatedMyNotes.push(note);
                    }
                })
                this.setState({ myNotes: updatedMyNotes, deletedNotes: updatedDeletedNotes });
            })
            .catch(error => {
                console.log(error);
            })
    }

    viewNoteHandler = (noteId) => {
        this.props.history.push("/notes/" + noteId);
    }

    restoreHandler = (noteId) => {
        axios.get('http://localhost:5000/api/notes/restore/' + noteId + '?auth=' + this.props.token)
            .then(response => {
                this.updateNotes();
            })
            .catch(error => {
                console.log(error);
            })
    }

    deleteHandler = (noteId) => {
        axios.delete('http://localhost:5000/api/notes/remove/' + noteId + '?auth=' + this.props.token)
            .then(response => {
                this.updateNotes();
            })
            .catch(error => {
                console.log(error.response);
            })
    }

    permanentDeleteHandler = (noteId) => {
        axios.delete('http://localhost:5000/api/notes/' + noteId + '?auth=' + this.props.token)
            .then(response => {
                this.updateNotes();
            })
            .catch(error => {
                console.log(error.message);
            })
    }

    switchTableModeHandler = () => {
        this.setState((prevState) => {
            return {
                showDeletedNotes: !prevState.showDeletedNotes
            }
        })
    }

    render () {
        let tableToShow = (
            <React.Fragment>
                {this.state.myNotes.map(note => {
                    return (
                        <tr key={note._id}>
                            <td onClick={() => this.viewNoteHandler(note._id)}>{note.title}</td>
                            <td className={classes.LgTableField} onClick={() => this.viewNoteHandler(note._id)}>{note.createdAt}</td>
                            <td className={classes.LgTableField} onClick={() => this.viewNoteHandler(note._id)}>{note.updatedAt}</td>
                            <td className={classes.LgTableField} onClick={() => this.viewNoteHandler(note._id)}>{note.description}</td>
                            <td><Link to={"/notes/edit/" + note._id}>edit</Link> | <Link to={{pathname: '/notes/' + note._id, hash: '#shareForm'}}>share</Link> | <span onClick={() => this.deleteHandler(note._id)} className={classes.DeleteLink}>delete</span></td>
                        </tr>
                    )
                })}
            </React.Fragment>
        )
        if (this.state.showDeletedNotes) {
            tableToShow = (
                <React.Fragment>
                    {this.state.deletedNotes.map(note => {
                        return (
                            <tr key={note._id}>
                                <td>{note.title}</td>
                                <td className={classes.LgTableField}>{note.createdAt}</td>
                                <td className={classes.LgTableField}>{note.updatedAt}</td>
                                <td className={classes.LgTableField}>{note.description}</td>
                                <td><Link onClick={() => this.restoreHandler(note._id)} to="#">restore</Link> | <span onClick={() => this.permanentDeleteHandler(note._id)} className={classes.DeleteLink}>delete</span></td>
                            </tr>
                        )
                    })}
                </React.Fragment>
            )
        }
        return (
            <div className={classes.Container}>
                <div className={classes.TableHeader}>
                    <h3 className={classes.Title}>{this.state.showDeletedNotes ? "Deleted Notes" : "Notes"}</h3>
                    <Link onClick={this.switchTableModeHandler} to="#">{this.state.showDeletedNotes ? "Back to notes" : "Deleted Notes"}</Link>
                </div>
                <div className={classes.ScrollableTable}>
                    <Table className={classes.Table} variant="dark" hover>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th className={classes.LgTableField}>Created Date</th>
                                <th className={classes.LgTableField}>Updated Date</th>
                                <th className={classes.LgTableField}>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableToShow}
                        </tbody>
                    </Table>
                </div>
                <div className={classes.TableHeader}>
                    <h3 className={classes.Title}>Shared Notes</h3>
                </div>
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