import { Alert, AlertTitle, CircularProgress } from "@mui/material"
import { useEffect, useState } from "react"
import { usePunchingTheClock } from "../http/types/usePunchingTheClock"
import { ButtonHover } from "./ButtonHover"
import { useAuth } from "../Context/AuthProvider"

export function GetButtonState() {

  const { state } = useAuth()
  const { mutate: updateUser } = usePunchingTheClock()

  const [geoLocale, setGeoLocale] = useState(false)
  const [itHit, setItHit] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // limites de casa
//   const minLat = -23.394077
//   const maxLat = -23.393976

//   const minLng = -46.276426
//   const maxLng = -46.275613

  // limites da igreja //
const minLat = -23.403781
const maxLat = -23.403107

const minLng = -46.347527
const maxLng = -46.346058

  const margem = 0.0010

  const verifyLocale = () => {
    setItHit(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        const dentroDaArea =
          latitude >= minLat - margem &&
          latitude <= maxLat + margem &&
          longitude >= minLng - margem &&
          longitude <= maxLng + margem

        setGeoLocale(dentroDaArea)
        setItHit(false)
      },
      () => {
        setGeoLocale(false)
        setItHit(false)
      }
    )
  }

  const handleBaterPonto = async () => {
    setItHit(true)

    try {
      const response = await fetch(
        "https://timeapi.io/api/Time/current/zone?timeZone=America/Sao_Paulo"
      )

      const data = await response.json()
      const horarioBrasilia = data.dateTime

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude

          updateUser(
            {
              token: String(state.token),
              latitude,
              longitude
            },
            {
              onSuccess: () => {
                setSuccessMessage(`Marcação realizada às ${horarioBrasilia}`)
                setErrorMessage(null)
                setItHit(false)
              },

              onError: (error: any) => {
                setErrorMessage(error.message || "Erro ao bater ponto")
                setSuccessMessage(null)
                setItHit(false)
              }
            }
          )
        },
      )
    } catch {
      setItHit(false)
    }
  }

  useEffect(() => {
    verifyLocale()
  }, [])

  useEffect(() => {
  if (errorMessage || successMessage) {
    const timer = setTimeout(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
    }, 5000)

    return () => clearTimeout(timer)
  }
}, [errorMessage, successMessage])

  if (itHit) {
    return (
      <div className="link_wrapper">
        <ButtonHover
          name="Validando..."
          icon={
            <figure className="flex justify-center items-center h-9">
                <CircularProgress color="inherit" size={20}/>
            </figure>
          }
        />
      </div>
    )
  }

  if (!geoLocale) {
    return (
      <div onClick={verifyLocale} className="link_wrapper">
        <ButtonHover
          name="Avaliar localidade"
          icon={
            <span className="relative flex justify-center items-center my-2 h-5 w-5">
              <span className="absolute h-full w-full rounded-full bg-red-400 animate-pulse"></span>
              <span className="relative h-2 w-2 bg-red-500 rounded-full"></span>
            </span>
          }
        />
      </div>
    )
  }

  return (
    <>
        <div onClick={handleBaterPonto} className="link_wrapper">
          <ButtonHover
            name="marcar presença"
            icon={
              <span className="relative flex justify-center items-center my-2 h-5 w-5">
                <span className="absolute h-full w-full rounded-full bg-green-400 animate-ping"></span>
                <span className="relative h-2 w-2 bg-green-500 rounded-full"></span>
              </span>
            }
          />
        </div>
        {errorMessage && (
          <span className="fixed bottom-15  border border-red-500 lg:bottom-5">
            <Alert severity="error">
              <AlertTitle>Erro</AlertTitle>
              {errorMessage}
            </Alert>
          </span>

        )}
        
        {successMessage && (
        <span className="fixed z-50 bottom-15 border border-green-500 lg:bottom-5">
            <Alert severity="success">
              <AlertTitle>Sucesso</AlertTitle>
              {successMessage}
            </Alert>
          </span>
        )}
    </>
  )
}