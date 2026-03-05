import { supabase } from "../lib/supabase"

export const addTransaction = async (transaction:any) => {
  const user = await supabase.auth.getUser()

  return await supabase.from("transactions").insert([
    {
      ...transaction,
      user_id: user.data.user?.id
    }
  ])
}

export const getTransactions = async () => {
  const user = await supabase.auth.getUser()

  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.data.user?.id)
    .order("created_at", { ascending:false })

  return data
}

export const deleteTransaction = async (id:string) => {
  return await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
}
