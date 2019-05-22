import React, { useState } from 'react'

// Material dialog
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

// Materal common
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const CourseEditingDialog = ({ state, handleClose, updateCourse }) => {
  const [name, setName] = useState('')

  const handleEdit = async (e) => {
    if (name === '') {
      window.alert('Course needs a name!')
      return
    }
    // Add update funct here
    console.log(name)
    setName('')
    handleClose()
  }

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Edit course</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Courses can be connected to other courses as prerequisites.
          </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
          </Button>
        <Button onClick={handleEdit} color="primary">
          Save
          </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CourseEditingDialog