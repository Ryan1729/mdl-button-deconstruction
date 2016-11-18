module MaterialUpdate exposing (..)

import MaterialModel exposing (MaterialModel)
import MaterialMsg
import Material


--This is basically just a passthrough except for what should go to Material.update


materialUpdate : MaterialMsg.MaterialMsg -> MaterialModel -> ( MaterialModel, Cmd MaterialMsg.MaterialMsg )
materialUpdate msg materialModel =
    case msg of
        MaterialMsg.Mdl msg' ->
            Material.update msg' materialModel
