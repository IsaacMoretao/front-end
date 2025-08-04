import { useEffect, useState } from "react"
import { useUserInformation } from "../http/types/useUserInformation"
import { useAuth } from "../Context/AuthProvider"
import { PencilSimple } from "phosphor-react"
import { useUpdateUser } from "../http/types/useUpdateUser"
import { useTheme } from "../Context/ThemeContext";
import { Skeleton } from "@mui/material";

export function UserInformation() {
  const { state } = useAuth()
  const { data: userData, isLoading, isError } = useUserInformation(state.token)
  const { mutate: updateUser } = useUpdateUser()
  const { darkMode } = useTheme();

  const [userName, setUserName] = useState("")
  const [newImage, setNewImage] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    if (userData?.username) setUserName(userData.username)
    if (userData?.avatarURL) setNewImage(userData.avatarURL)
  }, [userData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/png", "image/jpeg", "image/webp"]
    if (!validTypes.includes(file.type)) {
      alert("Apenas arquivos PNG, JPEG ou WEBP são permitidos.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string

      const img = new Image()
      img.onload = () => {
        if (img.width > 500) {
          alert("A imagem deve ter no máximo 500px de largura.")
          return
        }

        setNewImage(result)       // preview
        setImageFile(file)        // file real para envio
      }

      img.onerror = () => alert("Erro ao carregar a imagem.")
      img.src = result
    }

    reader.onerror = () => alert("Erro ao ler o arquivo.")
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword && newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.")
      return
    }

    if (!userData?.id) {
      alert("ID do usuário não encontrado.")
      return
    }
    updateUser({
      id: String(userData.id),
      username: userName,
      password: newPassword ? newPassword : undefined,
      avatar: imageFile, // ← arquivo real sendo enviado
    }, {
      onSuccess: () => {
        alert("Informações atualizadas com sucesso.")
      },
      onError: (error: any) => {
        alert(error.message || "Erro ao atualizar usuário.")
      }
    })
  }

  return (
    <main className={`flex items-center lg:ml-16 h-[100vh] ${darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}>
      <form className="flex flex-col items-center justify-center w-full" onSubmit={handleSubmit}>
        <div className="w-32 h-32 relative">
          <input
            type="file"
            id="avatar-upload"
            className="absolute w-full h-full z-20 opacity-0"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageChange}
          />

          <label htmlFor="avatar-upload" className="absolute cursor-pointer inset-0 flex items-center justify-center rounded-full bg-slate-600 bg-opacity-50 z-20 opacity-0 hover:opacity-100 transition-all">
            <PencilSimple size={52} weight="duotone" className="text-white" />
          </label>

          <figure className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
            {isLoading ? (
              <Skeleton variant="circular" width="100%" height="100%" />
            ) : (
              <img
                src={
                  newImage.startsWith("http") || newImage.startsWith("data:image/")
                    ? newImage
                    : `${import.meta.env.VITE_BASE_URL}/${newImage}`
                }

                alt="avatar"
                className="h-full w-full rounded-full bg-slate-300 object-cover"
              />
            )}
          </figure>
        </div>

        {isLoading ? (
          <p className="text-gray-500 mt-4">Carregando usuário...</p>
        ) : isError ? (
          <p className="text-red-500 mt-4">Erro ao carregar dados do usuário.</p>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-400">
              {userData?.position ?? "POSIÇÃO DO USUÁRIO"}
            </span>

            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={`w-full max-w-md px-4 py-2 my-2  border-[0.5px] border-gray-300 rounded-lg shadow-sm ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}
            />
          </>
        )}

        <span className="w-full max-w-md px-4">Mudar senha:</span>
        <input
          type="password"
          placeholder="nova senha"
          className={`w-full max-w-md px-4 py-2 my-2  border-[0.5px] border-gray-300 rounded-lg shadow-sm ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="confirmar nova senha"
          className={`w-full max-w-md px-4 py-2 my-2  border-[0.5px] border-gray-300 rounded-lg shadow-sm ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"}`}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="mt-4 inline-flex items-center justify-center px-6 py-2 bg-purple-600 text-white font-medium text-sm rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
        >
          Salvar
        </button>
      </form>
    </main>
  )
}
