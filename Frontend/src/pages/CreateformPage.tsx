import { Button } from "../Components/ui/button"
import { useNavigate, Route } from 'react-router-dom';

const Createform = () => {
  const route = useNavigate();
  return (
    <div className="flex justify-center items-center w-full">
      <Button className="bg-[#040E46] hover:bg-[#FF3434]" onClick={() => {route('/form');}}>Create Form</Button>
    </div>
  )
}

export default Createform
