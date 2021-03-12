import Container from "@/components/container"
import Nav from "@/components/nav"
import EditSubscribeForm from "@/components/edit-entry-form"

export default function EditEntryPage() {
  return (
    <>
      <Nav title="Edit" />
      <Container>
        <EditSubscribeForm />
      </Container>
    </>
  )
}
