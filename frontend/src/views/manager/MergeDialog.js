import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
  TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText
} from '@material-ui/core'
import Select from 'react-select/creatable'

import { MERGE_CONCEPTS } from '../../graphql/Mutation'
import { WORKSPACE_BY_ID } from '../../graphql/Query'
import {
  backendToSelect, onTagCreate, selectToBackend, tagSelectStyles
} from '../../dialogs/tagSelectUtils'

const MergeDialogContent = ({ state, setState, concepts, conceptTags }) => {
  if (!concepts) {
    return null
  }
  switch (state.step) {
  case 0: // Name
    return <>
      <DialogContentText>Choose name for the merged concept</DialogContentText>
      <Select
        onChange={({ value }) => setState({ ...state, name: value })}
        options={concepts.map(concept => ({ value: concept.name, label: concept.name }))}
        value={state.name ? { value: state.name, label: state.name } : undefined}
        menuPlacement='auto'
        menuPosition='fixed'
      />
    </>
  case 1: // Description
    return <>
      <DialogContentText>Write description for the merged concept</DialogContentText>
      <TextField
        autoFocus variant='outlined' margin='dense' type='text' label='Description'
        rows={2} rowsMax={10} value={state.description} fullWidth multiline
        onChange={evt => setState({ ...state, description: evt.target.value })}
      />
    </>

  case 2: // Tags
    if (state.tags === null) {
      setState({ ...state, tags: backendToSelect(concepts.flatMap(concept => concept.tags)) })
    }
    return <>
      <DialogContentText>Choose tags for the merged concept</DialogContentText>
      <Select
        onChange={selected => setState({ ...state, tags: selected || [] })}
        onCreateOption={newOption => setState({
          ...state,
          tags: [...state.tags, onTagCreate(newOption)]
        })}
        styles={tagSelectStyles}
        options={conceptTags}
        value={state.tags}
        isMulti
        menuPlacement='auto'
        menuPosition='fixed'
      />
    </>
  default:
    throw new Error('Invalid step')
  }
}

const stepField = ['name', 'description', 'tags']

const MergeDialog = ({ workspace, courseId, conceptIds, open, close }) => {
  const [state, setState] = useState({
    step: 0,
    name: null,
    description: '',
    official: false,
    tags: null
  })

  const [doMerge] = useMutation(MERGE_CONCEPTS, {
    refetchQueries: [{
      query: WORKSPACE_BY_ID,
      variables: {
        id: workspace.id
      }
    }]
  })

  const back = () => {
    setState({ ...state, step: state.step - 1 })
  }

  const submit = evt => {
    evt.preventDefault()
    if (state.step < 2) {
      setState({ ...state, step: state.step + 1 })
    } else {
      doMerge({
        variables: {
          workspaceId: workspace.id,
          courseId,
          conceptIds: Array.from(conceptIds),
          ...state,
          tags: selectToBackend(state.tags)
        }
      }).then(close)
    }
  }

  const concepts = conceptIds && workspace
    .courses.flatMap(course => course.concepts)
    .filter(concept => conceptIds.has(concept.id))

  const conceptTags = backendToSelect(workspace.conceptTags)

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='sm'>
      <DialogTitle>Merge concepts</DialogTitle>
      <form onSubmit={submit}>
        <DialogContent>
          <MergeDialogContent
            state={state} setState={setState} concepts={concepts} conceptTags={conceptTags}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={state.step <= 0 ? close : back} color='primary'>
            {state.step <= 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            type='submit' color='primary'
            disabled={state.step < 2 ? state[stepField[state.step]] === null : state.submitDisabled}
          >
            {state.step < 2 ? 'Next' : 'Merge'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default MergeDialog
