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
  const minLat = Number(import.meta.env.VITE_CHURCH_MIN_LAT)
  const maxLat = Number(import.meta.env.VITE_CHURCH_MAX_LAT)

  const minLng = Number(import.meta.env.VITE_CHURCH_MIN_LNG)
  const maxLng = Number(import.meta.env.VITE_CHURCH_MAX_LNG)

  // limites da igreja //
// const minLat = -23.403781
// const maxLat = -23.403107

// const minLng = -46.347527
// const maxLng = -46.346058

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
      },
      {
        enableHighAccuracy: false, // 🔥 MAIS RÁPIDO (não usa GPS pesado)
        timeout: 3000,             // ⏱ evita ficar esperando muito
        maximumAge: 60000          // ♻️ usa localização em cache (1 min)
      }
    )
  }

  const handleBaterPonto = async () => {
    setItHit(true)

    try {


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
                setSuccessMessage(`Sua presença foi marcada com sucesso !`)
                console.log(`Sua presença foi marcada com sucesso !`)
                setErrorMessage(null)
                setItHit(false)
              },

              onError: (error: any) => {
                setErrorMessage(error.message || "Erro ao bater ponto")
                console.log(error.message || "Erro ao bater ponto")
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
  <div className="fixed z-50 bottom-20 left-1/2 w-[90%] max-w-md -translate-x-1/2 lg:bottom-6">
    <Alert
      severity="error"
      className="shadow-lg rounded-xl border border-red-500 bg-white dark:bg-zinc-900 dark:text-white"
    >
      <AlertTitle className="font-semibold">Erro</AlertTitle>
      {errorMessage}
    </Alert>
  </div>
        )}

        {successMessage && (
          <div className="fixed z-50 bottom-20 left-1/2 w-[90%] max-w-md -translate-x-1/2 lg:bottom-6">
            <Alert
              severity="success"
              className="shadow-lg rounded-xl border border-green-500 bg-white dark:bg-zinc-900 dark:text-white"
            >
              <AlertTitle className="font-semibold">Sucesso</AlertTitle>
              {successMessage}
            </Alert>
          </div>
        )}
    </>
  )
}