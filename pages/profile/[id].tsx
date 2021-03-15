import Button from "@/components/button"
import Container from "@/components/container"
import Logo from "@/components/logo"
import AlertTypeChecklist, {
  typesChecklist,
} from "@/components/subscribe-form/AlertTypeChecklist"
import prisma from "@/lib/prisma"
import axios from "axios"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { AlertType } from "pages/api/fees"
import { useEffect, useState } from "react"

type ProfileProps = {
  email: string
  types: AlertType[]
  id: string
}
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const settings = await prisma.user.findUnique({
    where: { id: String(params?.id || -1) },
    select: {
      email: true,
      types: true,
    },
  })
  if (!settings) return { notFound: true }
  return {
    props: { ...settings, id: params.id },
  }
}

const Profile: React.FC<ProfileProps> = ({ email, types, id }) => {
  const [updateTypes, setTypes] = useState(typesChecklist)
  const [deleteSubmitted, setDeleteSubmitted] = useState(false)
  const [updateSubmitted, setUpdateSubmitted] = useState(false)
  const router = useRouter()

  // on mount, update types to match from database
  useEffect(() => {
    const newTypes = { ...updateTypes }
    if (types) {
      types.forEach((type) => (newTypes[type] = true))
      setTypes(newTypes)
    }
  }, [])

  function handleUpdateTypes(val: string) {
    setTypes({
      ...updateTypes,
      [val]: !updateTypes[val],
    })
  }

  async function submitDelete() {
    await axios.delete(`/api/user/${id}`)
    setDeleteSubmitted(true)
    setTimeout(() => router.push("/"), 2000)
  }

  async function submitUpdate() {
    await axios.put(`/api/user/${id}`, {
      email,
      types: Object.keys(updateTypes).filter((type) => updateTypes[type]),
    })

    setUpdateSubmitted(true)
    setTimeout(() => setUpdateSubmitted(false), 2000)
  }

  return (
    <div>
      <Container>
        <Logo />
        {deleteSubmitted ? (
          <h2>Your account has been deleted!</h2>
        ) : (
          <>
            <p>
              Save the link for this page to update your preferences at any
              time. A link will also be included in your email alerts.
            </p>
            <h2>
              <strong>Your Email: </strong>
              {email}
            </h2>
            {updateSubmitted ? (
              <p>Your changes have been saved</p>
            ) : (
              <AlertTypeChecklist
                types={updateTypes}
                handleUpdateTypes={handleUpdateTypes}
              />
            )}
            <Button onClick={submitUpdate} disabled={updateSubmitted}>
              Update Preferences
            </Button>
            <Button className="bg-red-600" onClick={submitDelete}>
              Delete Subscription
            </Button>
          </>
        )}
      </Container>
    </div>
  )
}

export default Profile
