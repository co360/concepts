import React, { useState, useEffect } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { makeStyles } from '@material-ui/core/styles'
import {
  Container, Button, TextField, Typography, FormHelperText, CircularProgress, Divider
} from '@material-ui/core'
import qs from 'qs'

import { CREATE_GUEST_ACCOUNT } from '../../graphql/Mutation'
import { HAKA_URL, signIn as tmcSignIn, isSignedIn } from '../../lib/authentication'
import { signIn as googleSignIn, init as googleInit } from '../../lib/googleAuth'
import { useLoginStateValue, useMessageStateValue } from '../../store'
import useRouter from '../../useRouter'
import { ReactComponent as HakaIcon } from '../../static/haka.svg'
import { noDefault } from '../../lib/eventMiddleware'

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  wrapper: {
    position: 'relative',
    margin: theme.spacing(1, 0),
    '& > .abcRioButton': {
      width: '100% !important'
    }
  },
  form: {
    marginTop: theme.spacing(1)
  },
  signInButton: {
    marginBottom: theme.spacing(0.5)
  },
  guestButton: {
    marginTop: theme.spacing(0.5)
  },
  hakaButton: {
    width: '100%',
    margin: theme.spacing(3, 0),
    display: 'block'
  },
  buttonProgress: {
    color: 'white',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}))

const LoginView = () => {
  const classes = useStyles()
  const { history, location } = useRouter()

  const createGuestMutation = useMutation(CREATE_GUEST_ACCOUNT)

  const [, dispatch] = useLoginStateValue()
  const [, messageDispatch] = useMessageStateValue()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState(false)
  const [loadingTMC, setLoadingTMC] = useState(false)
  const [loadingGuest, setLoadingGuest] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const loading = loadingTMC || loadingGuest || loadingGoogle

  const [googleLoginEnabled, setGoogleLoginEnabled] = useState(Boolean(window._googleAuthEnabled))

  const showGuestButton = Boolean(location.state)
  const nextPath = location.state ? location.state.from.pathname : '/'

  useEffect(() => {
    googleInit().then(result => setGoogleLoginEnabled(Boolean(result)))
  }, [])

  if (location.hash?.length > 1) {
    const query = qs.parse(location.hash.substr(1))
    if (query.token) {
      query.type = 'HAKA'
      window.localStorage.currentUser = JSON.stringify(query)
      dispatch({
        type: 'login',
        data: query.user,
        displayname: query.displayname,
        authType: query.type
      })
      history.push(nextPath)
      return null
    }
  }

  const authenticateGoogle = async () => {
    setLoadingGoogle(true)
    try {
      const data = await googleSignIn()
      dispatch({
        type: 'login',
        data: data.user,
        displayname: data.displayname,
        authType: data.type
      })
    } catch (err) {
      console.error(err)
      messageDispatch({
        type: 'setError',
        data: 'Google login failed'
      })
    }
    setLoadingGoogle(false)
    if (isSignedIn()) {
      history.push(nextPath)
    }
  }

  const authenticate = noDefault(async () => {
    setLoadingTMC(true)
    try {
      const resp = await tmcSignIn({ email, password })
      dispatch({
        type: 'login',
        data: resp.user,
        displayname: resp.displayname,
        authType: resp.type
      })
    } catch {
      setError(true)
      setTimeout(() => {
        setError(false)
      }, 4000)
    }
    setLoadingTMC(false)
    if (isSignedIn()) {
      history.push(nextPath)
    }
  })

  const createGuestAccount = async () => {
    const result = await createGuestMutation()
    const userData = result.data.createGuest
    userData.type = 'GUEST'
    window.localStorage.currentUser = JSON.stringify(userData)
    await dispatch({
      type: 'login',
      data: userData.user,
      authType: userData.type
    })
  }

  const continueAsGuest = evt => {
    evt.preventDefault()
    setLoadingGuest(true)
    createGuestAccount().then(() => {
      setLoadingGuest(false)
      if (isSignedIn()) {
        history.push(nextPath)
      }
    })
  }

  return (
    <Container component='main' maxWidth='xs'>
      <div className={classes.paper}>
        <Typography component='h1' variant='h5'>
          Sign in with <a href='https://www.mooc.fi/en/sign-up'>mooc.fi account</a>
        </Typography>

        <form
          className={classes.form}
          onSubmit={!loading ? authenticate : () => { }}
          noValidate
        >
          <TextField
            error={error}
            variant='outlined'
            margin='normal'
            required
            fullWidth
            label='email or username'
            name='email'
            autoComplete='email'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            autoFocus
          />

          <TextField
            error={error}
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='password'
            label='password'
            type='password'
            autoComplete='current-password'
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <FormHelperText error={error}>
            {error ? 'Invalid username or password.' : null}
          </FormHelperText>
          <div className={classes.wrapper}>
            <Button
              className={classes.signInButton}
              type='submit'
              fullWidth
              variant='contained'
              color='primary'
            >
              {!loadingTMC ? 'Sign In' : '\u00A0'}
            </Button>
            {loadingTMC && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        </form>
      </div>
      {HAKA_URL && <>
        <Divider />
        <div className={classes.wrapper}>
          <a className={classes.hakaButton} href={HAKA_URL}>
            <HakaIcon />
          </a>
        </div>
      </>}
      {googleLoginEnabled && <>
        <Divider />
        <div className={classes.wrapper}>
          <Button
            className={classes.googleButton}
            type='button'
            fullWidth
            variant='contained'
            color='primary'
            onClick={!loading ? authenticateGoogle : () => { }}
          >
            {!loadingGoogle ? 'Sign In with Google' : '\u00A0'}
          </Button>
          {loadingGoogle && <CircularProgress size={24} className={classes.buttonProgress} />}
        </div>
      </>}
      {showGuestButton && <>
        <Divider />
        <div className={classes.wrapper}>
          <Button
            className={classes.guestButton}
            type='button'
            fullWidth
            variant='contained'
            color='primary'
            onClick={!loading ? continueAsGuest : () => { }}
          >
            {!loadingGuest ? 'Continue as guest' : '\u00A0'}
          </Button>
          {loadingGuest && <CircularProgress size={24} className={classes.buttonProgress} />}
        </div>
      </>}
    </Container>
  )
}

export default LoginView
