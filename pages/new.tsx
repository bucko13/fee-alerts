import Nav from "@/components/nav"
import Container from "@/components/container"
import SubscribeForm from "@/components/subscribe-form"

export default function NewEntryPage() {
  return (
    <>
      <Nav title="New" />
      <Container className="w-full lg:w-2/4">
        <SubscribeForm />
      </Container>
    </>
  )
}
