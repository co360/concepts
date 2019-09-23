import React, { useState } from 'react'
import { Button, Typography, CircularProgress } from '@material-ui/core'
import Ajv from 'ajv'
import { useMutation } from 'react-apollo-hooks'

import cache from '../../apollo/update'
import schema from '../../static/port.schema'
import { useMessageStateValue, useLoginStateValue } from '../../store'
import { IMPORT_DATA } from '../../graphql/Mutation'
import { getPortErrorMessage } from '../../lib/errorParse'

const ajv = Ajv()
const validateData = ajv.compile(schema)

const WorkspaceCreationActions = ({ ctx, handleSubmit, submitDisabled }) => {
  const [, messageDispatch] = useMessageStateValue()
  const [data, setData] = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [{ user }] = useLoginStateValue()

  const dataPortingMutation = useMutation(IMPORT_DATA, {
    update: cache.jsonPortUpdate(user.id)
  })

  const handlePort = event => {
    event.preventDefault()
    if (data !== '') {
      sendData(data)
    } else {
      handleSubmit(true)
    }
  }

  const addStateDataToJSON = (jsonData) => {
    if (ctx.inputState.name !== '') {
      jsonData.workspace = ctx.inputState.name
      delete jsonData.workspaceId
      delete jsonData.projectId
    }
  }

  const sendData = async (data) => {
    let jsonData
    try {
      jsonData = JSON.parse(data)
    } catch (error) {
      messageDispatch({
        type: 'setError',
        data: 'Malformed JSON'
      })
      return
    }

    addStateDataToJSON(jsonData)
    if (!validateData(jsonData)) {
      messageDispatch({
        type: 'setError',
        data: getPortErrorMessage(validateData.errors[0])
      })
      return
    }

    setLoading(true)

    try {
      await dataPortingMutation({
        variables: {
          data: JSON.stringify(jsonData)
        }
      })
    } catch (err) {
      messageDispatch({
        type: 'setError',
        data: 'Error sending data'
      })
    }

    setLoading(false)
    setData(null)
    ctx.closeDialog()
  }

  const openFile = (event) => {
    event.preventDefault()
    if (event.target.files.length === 0) return
    const fileReader = new FileReader()
    const fName = event.target.files[0].name

    fileReader.onload = (event) => {
      event.preventDefault()
      const content = fileReader.result
      setData(content)
      setFileName(fName)
    }

    fileReader.readAsText(event.target.files[0])
  }

  return (
    <>
      <Button
        color='primary'
        component='label'
        label='Import'
        disabled={loading}
      >
              Import
        <input type='file' onChange={openFile} allow='text/*' hidden />
      </Button>
      <Typography variant='subtitle1'>{fileName}</Typography>
      <Button onClick={ctx.closeDialog} disabled={loading} color='primary'>
        Cancel
      </Button>
      <Button
        onClick={handlePort}
        disabled={submitDisabled || loading}
        color='primary'
      >
        {!loading ? 'Create' : <CircularProgress size={20} />}
      </Button>
    </>
  )
}

export default WorkspaceCreationActions
