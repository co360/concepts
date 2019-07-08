import React, { useState, useEffect } from 'react'

//  dialog
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

// Materal common
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

// Error dispatcher
import { useErrorStateValue } from '../../store'

const ConceptAdditionDialog = ({ state, handleClose, createConcept, workspaceId }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitDisabled, setSubmitDisabled] = useState(false)

  const errorDispatch = useErrorStateValue()[1]

  useEffect(() => {
    if (state.open) {
      setName('')
      setDescription('')
      setSubmitDisabled(false)
    }
  }, [state])

  const handleConceptAdding = () => {
    if (submitDisabled) return
    if (name === '') {
      window.alert('Concept needs a name!')
      return
    }
    setSubmitDisabled(true)
    createConcept({
      variables: {
        courseId: state.id,
        workspaceId,
        name,
        description,
        official: false
      }
    })
      .catch(() => {
        errorDispatch({
          type: 'setError',
          data: 'Access denied'
        })
      })
      .finally(handleClose)
  }

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
      aria-labelledby='form-dialog-title'
    >
      <DialogTitle id='form-dialog-title'>
        Add concept
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          id='name'
          label='Name'
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        <TextField
          multiline
          margin='dense'
          id='description'
          label='Description'
          type='text'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          variant='outlined'
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color='primary'>
          Cancel
        </Button>
        <Button
          onClick={handleConceptAdding}
          disabled={submitDisabled}
          color='primary'
        >
          Add concept
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConceptAdditionDialog
